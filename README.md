[![Build Status](https://travis-ci.org/rabelloo/n11n.svg?branch=master)](https://travis-ci.org/rabelloo/n11n)
[![Coverage Status](https://codecov.io/gh/rabelloo/n11n/branch/master/graph/badge.svg)](https://codecov.io/gh/rabelloo/n11n)

# n11n

Normalization for TypeScript/JavaScript

## What's with the name?

- Globalization => g(11 letters)n
- Internationalization => i(18 letters)n
- Localization => l(10 letters)n
- Normalization => n(11 letters)n

## Why does this exist?

I know what you're thinking, **why not use [normalizr](https://github.com/paularmstrong/normalizr) instead**?

It's a great library made by great people, but I wanted a nicer API,
especially when working with TypeScript.

By no means this was built to replace it, nor am I claiming it's better,
but I do have a very different approach to how it's done and it fits my own use.

Let me try and explain why I felt this way:

1. First of all, I wanted schema intellisense based on my object type/interface;
2. Second, I felt like the `Schema` functions like `normalize` and `denormalize`
   should belong to the instance instead of being stand-alone functions that receive
   it as an argument, since they do relate directly with the object.
   This is not me being picky about OOP, I do believe the API improves in that sense;
3. Third, I realized a simple object argument for the `schema` initializer with
   entity keys as properties and id accessors as values would easily solve 1;
4. Fourth, more often than not I found myself not using the whole
   response from the `normalize` function because I just wanted to transform an
   object without retrieving it's inner entities (because I knew I already had them,
   or because I was just trimming for an HTTP request);
5. Fifth, and this is getting long, I realized that the `Schema` could be used
   just to transform an object if you set `processStrategy` or merge complex structures
   using `mergeStrategy` (see 4.);
6. Last but not least, I realized I could infer the entity names from the property names
   of the argument object passed to `schema`, while still providing a way to override it
   if need be - for really extraordinary plurals or property aliases e.g. `{ owner: User } => 'users'`

That said, this is still a work in progress and much can be improved.

Please feel free to provide feedback and submit issues, if you find yourself using it.

## Usage

Like [normalizr](https://github.com/paularmstrong/normalizr), it's pretty simple.

You just need your interfaces:

```typescript
interface Movie {
  id: number;
  title: string;
  director: Director;
}

interface Director {
  id: string;
  name: string;
  movies: Movie[];
}
```

Your schemas:

```typescript
const movieSchema = schema<Movie>({
  director: d => d.id,
  // or
  director: 'id',
});

const directorSchema = schema<Director>({
  movies: [m => m.id],
  // or
  movies: ['id'],
});
```

Your data:

```typescript
const georgeLucas = {
  id: 't1234',
  name: 'George Lucas',
  movies: [],
};

const starWars4 = {
  id: 1,
  title: 'Star Wars: Episode IV - A New Hope',
  director: georgeLucas,
};

const starWars5 = {
  id: 2,
  title: 'Star Wars: Episode V - The Empire Strikes Back',
  director: georgeLucas,
};

// creating a circular reference,
// but it could also be duplicate data, doesn't matter
georgeLucas.movies = [starWars4, starWars5];
```

### Normalize

And you're good to go:

```typescript
directorSchema.normalize(georgeLucas);
// { id: 't1234', name: 'George Lucas', movies: [1, 2] }

movieSchema.normalize([starWars4, starWars5]);
// [
//   {
//     id: 1,
//     title: 'Star Wars: Episode IV - A New Hope',
//     director: 't1234'
//   },
//   {
//     id: 2,
//     title: 'Star Wars: Episode V - The Empire Strikes Back',
//     director: 't1234'
//   },
// ]
```

You can use either `arrays` or `objects`, as demonstrated above.

### Entities

To extract `entities`, simply call the respective `Schema` function
(decoupling from `normalize()` is efficient and runs fast, test it out!):

```typescript
movieSchema.entities([starWars4, starWars5]);
// {
//   directors: [
//     {
//       id: 't1234',
//       name: 'George Lucas',
//       movies: [starWars4, starWars5],
//     },
//   ],
// }

directorSchema.entities(georgeLucas);
// {
//   movies: [
//     {
//       id: 1,
//       title: 'Star Wars: Episode IV - A New Hope',
//       director: georgeLucas,
//     },
//     {
//       id: 2,
//       title: 'Star Wars: Episode V - The Empire Strikes Back',
//       director: georgeLucas,
//     },
//   ],
// }
```

If you have a keen eye you noticed circular references are kept.
They were also abbreviated as variables above.

The solution is simple: to define a clone/preprocess strategy (called `processStrategy`
in [normalizr](https://github.com/paularmstrong/normalizr)):

```typescript
const movieSchema = schema<Movie>(
  { director: d => d.id },
// vvvvvvvvvv     it's an optional second argument to schema()
  movie => ({
    ...movie,
    director: directorSchema.normalize(movie.director),
//            ^^^^^^^^^^^^^^
// we can use the other schema to normalize it
  })
});

movieSchema.entities([starWars4, starWars5]);
// {
//   directors: [
//     {
//       id: 't1234',
//       name: 'George Lucas',
//       movies: [1, 2], // <=== not circular anymore
//     },
//   ],
// }
```

In fact this occurs so commonly that **there's a helper** for creating
the cloner function: `linear()`.

```typescript
const movieSchema = schema<Movie>( { director: d => d.id },
  linear({
//  each key is a property of Movie
//  vvvvvvvv
    director: directorSchema
//            ^^^^^^^^^^^^^^
//  each value a schema of the property's type
  })
});
```

You could create new `Schema`s too, there's no problem because
**they're just a set of pure functions, there are no classes involved**.

```typescript
const movieSchema = schema<Movie>( { director: d => d.id },
  linear({
    director: schema<Director>({ movies: [m => m.id] }),
    //        ^^^^^^^^^^^^^^^^
    //  we can also create a new schema
  })
});
```

Reusing `Schema`s could be a problem because you have circular
dependencies in the `Schema`s themselves.

`movieSchema <==> directorSchema`

An easy pattern to adopt are `Schema` creators:

```typescript
function createMovieSchema() {
  return schema<Movie>(
    { director: d => d.id },
    linear({
      director: createDirectorSchema(),
    })
  );
}

function createDirectorSchema() {
  return schema<Director>(
    { movie: m => m.id },
    linear({
      movies: createDirectorSchema(),
    })
  );
}

const movieSchema = createMovieSchema();
const directorSchema = createDirectorSchema();
movieSchema.normalize([starWars4, starWars5]);
```

Feel free to come up with your own cool patterns and let me know!

## Denormalize

After you've successfully normalized and extracted entities from your data,
you might want to denormalize it at some point, perhaps for component consumption.

Just feed it your normalized object/array and the entities you extracted:

```typescript
const normalizedLucas = directorSchema.normalize(georgeLucas);
const entities = directorSchema.entities(georgeLucas);

directorSchema.denormalize(normalizedLucas, entities);
// {
//   id: 't1234',
//   name: 'George Lucas',
//   movies: [
//     {
//       id: 1,
//       title: 'Star Wars: Episode IV - A New Hope',
//       director: 't1234',
//     },
//     {
//       id: 2,
//       title: 'Star Wars: Episode V - The Empire Strikes Back',
//       director: 't1234',
//     },
//   ],
// }
```

## Gotchas

### Entity name

Unlike `normalizr`, you don't need to name the `Schema.Entity`,
it's inferred from the property name e.g.

```typescript
schema<Movie>({
  director: d => d.id, // <== 'directors'
});
```

Yes, it auto pluralizes. If you want a different name for some reason
(aliases, weird plurals), you can wrap your key in an array and pass
the alias as the first item in it - a tuple of [`string`, `Key`]:

```typescript
const farm = schema<Farm>({
  //    your entity name
  //         vvvvvv
  owner:  [ 'people',    'id'     ],
  owners: [ 'people',   ['id']    ],
  goose:  [ 'geese',   g => g.id  ],
  geese:  [ 'geese',  [g => g.id] ],
  //                   ^^^^^^^^^
  // you can still use any version of Key<T>
});

farm.entities({
  owner:   { id: 1 },
  owners: [{ id: 2 }],
  goose:   { id: 3 },
  geese:  [{ id: 4 }],
});
// {
//   owners: [
//     { id: 1 },
//     { id: 2 },
//   ],
//   geese: [
//     { id: 3 },
//     { id: 4 },
//   ],
// }
```

### Merge strategy

Simply pass it as the last item in your `Key` Tuple, it's optional:


```typescript
schema<Movie>({
  //                  this is the default function btw
  //                    vvvvvvvvvvvvvvvvvvvvvvvvvv
  director: [d => d.id, (a, b) => ({ ...a, ...b })],
  // or
  director: ['producers', d => d.id, (a, b) => ({ ...a, ...b })],
  //          ^^^^^^^^^
  //     you can pass alias too
});
```

So effectively either `[ alias?, Key!, mergeFunction? ]` or `Key!`

### Arrays

For every property that is an `Array`, simply wrap the key in square brackets `[]`:

```typescript
schema<Director>({
  movies: [m => m.id],
  // or
  movies: ['films', [m => m.id]],
  // or
  movies: ['films', [m => m.id], myMergeStrategy],
});
```

### Keys

For `K in keyof T`, they are either `K`, `(t: T) => T[K]` or `Schema<T[K]>`:

Meaning:

```typescript
schema<Movie>({
  director: 'id',
  // or
  director: d => d.id,
  // or
  director: schema<Director>({}),
});
```

Feel free whatever as a key, but your only parameter is the item itself:


```typescript
schema<Movie>({
  director: d => myHashFunction(d.name),
  // or composite keys
  director: d => d.name + d.movies.length
});
```


## Cool tricks

### Object transformation

As stated before, you can use `Schema`s to transform objects without
necessarily normalizing them.

Simply use the second argument to pass in a cloning function:

```typescript
let id = 0;
const directorSchema = schema<Director>(
  {}, // <== notice the empty normalizer keys arg
  director => ({
    id: ++id,
    name: `Director: ${name}`,
    movies: mapMovies(director.movies),
    //      ^^^^^^^^^  defined somewhere else
  })
);

directorSchema.normalize(georgeLucas);
//  {
//    id: 1,
//    name: 'Director: George Lucas',
//    movies: << mapped by funcion >>
//  }
```

## Notes

Still missing implementation are:

- The `Union` operation, where a property defines the type of entity
