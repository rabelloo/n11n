import { linear, schema, Schema } from '../index';
import { ObjectMap } from '../object-map';

describe('schema', () => {
  let georgeLucas: Director;
  let starWars4: Movie;
  let starWars5: Movie;
  let movieSchema: Schema<Movie>;
  let directorSchema: Schema<Director>;

  const setupMovieSchema = () => {
    movieSchema = schema<Movie>({ director: d => d.id });
  };
  const setupDirectorSchema = () => {
    directorSchema = schema<Director>({ movies: [m => m.id] });
  };

  beforeEach(() => {
    georgeLucas = {
      id: 't1234',
      name: 'George Lucas',
      movies: [],
    };

    starWars4 = {
      id: 1,
      title: 'Star Wars: Episode IV - A New Hope',
      director: georgeLucas,
    };

    starWars5 = {
      id: 2,
      title: 'Star Wars: Episode V - The Empire Strikes Back',
      director: georgeLucas,
    };

    // creating a circular reference,
    // but it could also be duplicate data, doesn't matter
    georgeLucas.movies = [starWars4, starWars5];
  });

  it('should accepted nested schemas', () => {
    setupMovieSchema();

    directorSchema = schema<Director>({
      movies: [movieSchema],
    });

    expect(directorSchema).toBeDefined();
  });

  describe('normalize', () => {
    it('should normalize an object', () => {
      setupDirectorSchema();

      const normalized = directorSchema.normalize(georgeLucas);

      expect(normalized).not.toBe(georgeLucas);
      expect(normalized).toEqual({
        ...georgeLucas,
        movies: [starWars4, starWars5].map(m => m.id),
      });
    });

    it('should normalize an array', () => {
      setupMovieSchema();

      const normalized = movieSchema.normalize([starWars4, starWars5]);

      expect(normalized[0]).not.toBe(starWars4);
      expect(normalized[1]).not.toBe(starWars5);
      expect(normalized).toEqual(
        [starWars4, starWars5].map(movie => ({
          ...movie,
          director: georgeLucas.id,
        }))
      );
    });

    it('should work with string as property key when provided', () => {
      directorSchema = schema<Director>({ movies: ['id'] });

      const normalized = directorSchema.normalize(georgeLucas);

      expect(normalized.movies).toEqual([starWars4.id, starWars5.id]);
    });

    it('should simply clone an already normalized object', () => {
      setupDirectorSchema();
      const normalized = directorSchema.normalize(georgeLucas);

      const renormalized = directorSchema.normalize(normalized);

      expect(renormalized).not.toBe(normalized);
      expect(renormalized).toEqual(normalized);
    });
  });

  describe('denormalize', () => {
    it('should denormalize an object', () => {
      setupDirectorSchema();
      const normalized = directorSchema.normalize(georgeLucas);
      const entities = directorSchema.entities(georgeLucas);

      const denormalized = directorSchema.denormalize(normalized, entities);

      expect(denormalized).not.toBe(georgeLucas);
      expect(denormalized).toEqual(georgeLucas);
    });

    it('should denormalize an array', () => {
      setupMovieSchema();
      const normalized = movieSchema.normalize([starWars4, starWars5]);
      const entities = movieSchema.entities([starWars4, starWars5]);

      const denormalized = movieSchema.denormalize(normalized, entities);

      expect(denormalized[0]).not.toBe(starWars4);
      expect(denormalized[1]).not.toBe(starWars5);
      expect(denormalized).toEqual([starWars4, starWars5]);
    });

    it('should return the normalized reference itself if no entity is found', () => {
      setupDirectorSchema();
      const normalized = directorSchema.normalize(georgeLucas);

      const denormalized = directorSchema.denormalize(normalized, {});

      expect(denormalized.movies).toEqual([starWars4.id, starWars5.id]);
    });

    it('should handle null/undefined when expecting arrays', () => {
      setupDirectorSchema();
      const normalized = directorSchema.normalize({
        ...georgeLucas,
        movies: null as any,
      });

      const denormalized = directorSchema.denormalize(normalized, {});

      expect(denormalized.movies).toEqual([]);
    });
  });

  describe('entities', () => {
    it('should extract all schema entities from an object', () => {
      setupDirectorSchema();
      const entities = directorSchema.entities(georgeLucas);

      expect(entities.movies[starWars4.id]).not.toBe(starWars4);
      expect(entities).toEqual({
        movies: toObjectMap([starWars4, starWars5], m => m.id),
      });
    });

    it('should extract all schema entities from an array', () => {
      setupMovieSchema();
      const entities = movieSchema.entities([starWars4, starWars5]);

      expect(entities.directors).not.toBe(georgeLucas);
      expect(entities).toEqual({
        directors: { [georgeLucas.id]: georgeLucas },
      });
    });

    it('should prevent null objects from being added to the resulting entities', () => {
      setupMovieSchema();
      const directorless = { id: 5, title: 'Directorless' } as Movie;

      const entities = movieSchema.entities(directorless);

      expect(entities).not.toBe(starWars4);
    });

    it('should remove circular references when using linear()', () => {
      movieSchema = schema<Movie>(
        { director: d => d.id },
        linear<Movie>({ director: directorSchema })
      );

      const entities = movieSchema.entities(starWars4);

      expect(entities.directors).toEqual({
        [georgeLucas.id]: {
          ...georgeLucas,
          movies: georgeLucas.movies.map(m => m.id),
        },
      });
    });

    it('should rename entities with aliases if provided', () => {
      const alias = 'producers';
      movieSchema = schema<Movie>({
        director: [alias, (d: Director) => d.id],
      });

      const entities = movieSchema.entities(starWars4);

      expect(entities[alias]).toBeDefined();
      expect(entities.directors).not.toBeDefined();
    });

    it('should use the merge function if provided', () => {
      movieSchema = schema<Movie>({ director: [d => d.id, (_, b) => b] });
      directorSchema = schema<Director>({ movies: [[m => m.id], (_, b) => b] });

      const movieEntities = movieSchema.entities(starWars4);
      const directorEntities = directorSchema.entities(georgeLucas);

      expect(movieEntities.directors[georgeLucas.id]).toBe(georgeLucas);
      expect(directorEntities.movies[starWars4.id]).toBe(starWars4);
    });

    it('should use an alias and merge function if provided', () => {
      const alias = 'films';
      directorSchema = schema<Director>({
        movies: [alias, [m => m.id], (_, b) => b],
      });

      const entities = directorSchema.entities(georgeLucas);

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

function toObjectMap<T>(
  data: T[],
  keyFn: (item: T, index: number) => any
): ObjectMap<T> {
  return data.reduce(
    (hashMap, item, index) => ({
      ...hashMap,
      [`${keyFn(item, index)}`]: item,
    }),
    {}
  );
}
