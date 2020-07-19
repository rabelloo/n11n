import { linear, schema } from '../index';

describe('schema', () => {
  const georgeLucas: Director = {
    id: 't1234',
    name: 'George Lucas',
    movies: [],
  };
  const starWars4: Movie = {
    id: 1,
    title: 'Star Wars: Episode IV - A New Hope',
    director: georgeLucas,
  };
  const starWars5: Movie = {
    id: 2,
    title: 'Star Wars: Episode V - The Empire Strikes Back',
    director: georgeLucas,
  };

  // creating a circular reference,
  // but it could also be duplicate data, doesn't matter
  georgeLucas.movies = [starWars4, starWars5];

  const movieSchema = schema<Movie>({ director: (d) => d.id });
  const directorSchema = schema<Director>({ movies: [(m) => m.id] });

  it('should accepted nested schemas', () => {
    const result = schema<Director>({ movies: [movieSchema] });

    expect(result).toBeDefined();
  });

  describe('normalize', () => {
    it('should normalize an object', () => {
      const result = directorSchema.normalize(georgeLucas);

      expect(result).not.toBe(georgeLucas);
      expect(result).toStrictEqual({
        ...georgeLucas,
        movies: [starWars4, starWars5].map((m) => m.id),
      });
    });

    it('should normalize an array', () => {
      const result = movieSchema.normalize([starWars4, starWars5]);

      expect(result[0]).not.toBe(starWars4);
      expect(result[1]).not.toBe(starWars5);
      expect(result).toStrictEqual(
        [starWars4, starWars5].map((movie) => ({
          ...movie,
          director: georgeLucas.id,
        }))
      );
    });

    it('should work with string as property key when provided', () => {
      const testSchema = schema<Director>({ movies: ['id'] });

      const result = testSchema.normalize(georgeLucas);

      expect(result.movies).toStrictEqual([starWars4.id, starWars5.id]);
    });

    it('should simply clone an already normalized object', () => {
      const normalized = directorSchema.normalize(georgeLucas);

      const result = directorSchema.normalize(normalized);

      expect(result).not.toBe(normalized);
      expect(result).toStrictEqual(normalized);
    });
  });

  describe('denormalize', () => {
    it('should denormalize an object', () => {
      const normalized = directorSchema.normalize(georgeLucas);
      const entities = directorSchema.entities(georgeLucas);

      const result = directorSchema.denormalize(normalized, entities);

      expect(result).not.toBe(georgeLucas);
      expect(result).toStrictEqual(georgeLucas);
    });

    it('should denormalize an array', () => {
      const normalized = movieSchema.normalize([starWars4, starWars5]);
      const entities = movieSchema.entities([starWars4, starWars5]);

      const result = movieSchema.denormalize(normalized, entities);

      expect(result[0]).not.toBe(starWars4);
      expect(result[1]).not.toBe(starWars5);
      expect(result).toStrictEqual([starWars4, starWars5]);
    });

    it('should return the normalized reference itself if no entity is found', () => {
      const normalized = directorSchema.normalize(georgeLucas);

      const result = directorSchema.denormalize(normalized, {});

      expect(result.movies).toStrictEqual([starWars4.id, starWars5.id]);
    });

    it('should handle null/undefined when expecting arrays', () => {
      const normalized = directorSchema.normalize({
        ...georgeLucas,
        movies: null as any,
      });

      const result = directorSchema.denormalize(normalized, {});

      expect(result.movies).toStrictEqual([]);
    });
  });

  describe('entities', () => {
    it('should extract all schema entities from an object', () => {
      const entities = directorSchema.entities(georgeLucas);

      expect(entities.movies[starWars4.id]).not.toBe(starWars4);
      expect(entities).toStrictEqual({
        movies: toRecord([starWars4, starWars5], (m) => m.id),
      });
    });

    it('should extract all schema entities from an array', () => {
      const entities = movieSchema.entities([starWars4, starWars5]);

      expect(entities.directors).not.toBe(georgeLucas);
      expect(entities).toStrictEqual({
        directors: { [georgeLucas.id]: georgeLucas },
      });
    });

    it('should prevent null objects from being added to the resulting entities', () => {
      const directorless = { id: 5, title: 'Directorless' } as Movie;

      const entities = movieSchema.entities(directorless);

      expect(entities).not.toBe(starWars4);
    });

    it('should remove circular references when using linear()', () => {
      const testSchema = schema<Movie>(
        { director: (d) => d.id },
        linear<Movie>({ director: directorSchema })
      );

      const entities = testSchema.entities(starWars4);

      expect(entities.directors).toStrictEqual({
        [georgeLucas.id]: {
          ...georgeLucas,
          movies: georgeLucas.movies.map((m) => m.id),
        },
      });
    });

    it('should rename entities with aliases if provided', () => {
      const alias = 'producers';
      const testSchema = schema<Movie>({
        director: [alias, (d: Director) => d.id],
      });

      const entities = testSchema.entities(starWars4);

      expect(entities[alias]).toBeDefined();
      expect(entities.directors).not.toBeDefined();
    });

    it('should use the merge function if provided', () => {
      const testMovieSchema = schema<Movie>({
        director: [(d) => d.id, (_, b) => b],
      });
      const testDirectorSchema = schema<Director>({
        movies: [[(m) => m.id], (_, b) => b],
      });

      const movieEntities = testMovieSchema.entities(starWars4);
      const directorEntities = testDirectorSchema.entities(georgeLucas);

      expect(movieEntities.directors[georgeLucas.id]).toBe(georgeLucas);
      expect(directorEntities.movies[starWars4.id]).toBe(starWars4);
    });

    it('should use an alias and merge function if provided', () => {
      const alias = 'films';
      const testSchema = schema<Director>({
        movies: [alias, [(m) => m.id], (_, b) => b],
      });

      const entities = testSchema.entities(georgeLucas);

      expect(entities[alias][starWars4.id]).toBe(starWars4);
    });
  });
});

interface Movie {
  id: number;
  title: string;
  director: Director;
}

interface Person {
  id: string;
  name: string;
}

interface Director extends Person {
  movies: Movie[];
}

const toRecord = <T>(data: T[], keyFn: KeyFn<T>): Record<string, T> =>
  Object.fromEntries(
    Object.values(data).map((item, index) => [`${keyFn(item, index)}`, item])
  );

type KeyFn<T> = (item: T, index: number) => string | number;
