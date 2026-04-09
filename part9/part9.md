# Main principle

Typescript is a typed superset of javascript, its compiled into plain javascript code. The programmer is even able to decide the version of the generated code, as long as its ECMAScript 3 or newer. Typescript being a superset of javascript means that it includes all the features of javascript and its additional features as well. In other words, all exisiting javascript code is valid typescript.

Typescript consits of three separate, but mutually fulfilling parts:
- The language
- The compiler
- The language service

The language consists of syntax, keywords and type annotations. Programmmers have the most direct contact with the language. 

The compiler is responsible for type information erasure (i.e. removing the typing information) and for code transformation. The code transformations enable typescript code to be transpiled into executable javascript. Everything related to the types is removed at compile time, so typescript isn't genuine statically typed code.

Traditionally, compiling means that code is transformed from a human-readable format to a machine-readable format. In typescript, human-readable source code is transformed into another human-readable source code, so the correct term would be transpiling. 

The compiler also performed a static code analysis. It can emit warnings or errors if it finds a reason to do so, and it can set to perform additional tasks such as combining the generated code into a single file.

The language service collects type information from the source code. Development tools can use the type information for providing intellisense, type hints and possible refactoring alternatives.

# Typescript key language features

## Type annotations

Type annotations in typescript are a lightweight way to record the intended contract of a function or a variable. In the example below, we have defined a `birthdayGreeter` function that accepts two arguments: one of type string and one of type number. The function will return a string.
```typescript
const birthdayGreeter = (name: string, age: number): string => {
  return `Happy birthday ${name}, you are now ${age} years old!`;
};

const birthdayHero = "Jane User";
const age = 22;

console.log(birthdayGreeter(birthdayHero, age));
```

## Keywords

Keywords in typescript are specially reserved words that embody designated teleological meaning within the construct of the language. They cannot be used as identifiers (variable, names, function names, class names, etc.) because they are part of the syntax of the language. An attempt to use these keywords will result in syntax or semantic errors. There are about 40-50 keywords in typescript. Some of these keywords include: type, enum, interface, void, null, instance etc. One thing to note is that, typescript inherits all the reserved keywords from kavascript, plus it adds a few of its own type-related keywords like interface, type, enum.

## Type inference

The typescript compiler can attempt to infer the type information if no type has been specified. Variables types can be inferred based on their assigned value and their usage. The type inference takes place when initializing variables and memebrs, setting paramter default values, and determining function return types.

For example, consider the function `add`:
```javascript
const add = (a: number, b: number) => {
  /* The return value is used to determine
     the return type of the function */
  return a + b;
}
```
The type of the functions return value is inferred by retracing the code back to the return expression. The return expression performs and addition of the paramteres a and b. We can see that a and b are numbers based on their types. Thus, we can infer the return value to be of type `number`.

## Type erasure

Typescript removes all type system constructs during compilation.

Input:
```javascript
let x: SomeType;
```

Output:
```javascript
let x;
```
This means that no type information remains at runtime; nothing says that some variable x was delcared as being of type `someType`.

# Why should one use typescript

Typescript offers type checking and static code analysis. We can require values to be of a certain type and have the compiler warn about using them incorrectly. This can reduce runtime errors, and you might even be able to reduce the number of required unit tests in a project, at least concerning pure-type tests. The static code analysis doesn't only warn about wrongful type usage, but also other mistakes such as misspelling a variable or function name or trying to use a variable beyond its scope.

Another advantage is that the type annotations in the code can function as a kind of code-level documentation. It's easy to check from a function signature what kind of arguments the function can consume and what type of data it will return.

Types can be reused all around the code base, and a change to a type definition will automatically be reflected everywhere the type is used. One might arguue that you can achieve similar code-level documentation with e.g. JSDoc, but it is not conneceted to the code as tightly as typescripts types, and may thus get out of sync more easily, and is also more verbose.

Another advantage is that IDEs can provide more specific and smater IntelliSense when they know exactyl what types of data you are processing.

# Setting up typescript

When can either run typescript by installing it globally or by installing it as a package. The `tsconfig.json` file includes how the typescript compiler should interpret the code. It can change how strict the compiler is, while files to watch or ignore and more.

# Creating your own types

We can create a `type` using the typescript native keyword `type`. For example:
```typescript
type Operation = 'multiply' | 'add' | 'divide';
```
The `Operation` type only accepts three kinds of valuesl exactly the three string we wanted. Using the OR operator `|` we can define a variable to accept multiple values by creating a union type. In this case we used exact strings with the union, you could also make the compiler accept for example both string and number: `string | number`.

We can also specify the return type of a function, for example:
```typescript
type Operation = 'multiply' | 'add' | 'divide';

const calculator = (a: number, b: number, op: Operation) : number => {
  switch(op) {
    case 'multiply':
      return a * b;
    case 'divide':
      if (b === 0) throw new Error('Can\'t divide by 0!');
      return a / b;
    case 'add':
      return a + b;
    default:
      throw new Error('Operation is not multiply, add or divide!');
  }
}
```
This takes in a number as `a`, a number as `b` and a `Operation` as op. The return value is a number.

# Type narrowing

The default type of the catch block parameter `error` is `unknown`. Anything is allowed to be assigned to `unknown`, but `unknown` isnt assignable to anything but itself and `any` without a type assertion or a control flow-based type narrowing.

Since the default type of the `error` object in typescript is `unknown`, we have to narrow the type to access the field:
```typescript
try {
  console.log(calculator(1, 5 , 'divide'));
} catch (error: unknown) {
  let errorMessage = 'Something went wrong: '
  // here we can not use error.message

  if (error instanceof Error) {
    // the type is narrowed and we can refer to error.message

    errorMessage += error.message;
  }
  // here we can not use error.message

  console.log(errorMessage);
}
```

# @tpyes/{npm_package}

In typescript everything we write and compile has to be typed in order for it to be able to execute. In order to install a package and their types we can install the package with a `@types/` prefix. For example `npm install --save-dev @types/react`. Sometimes, an npm package can also include its types within the code and, in thtat case, installing the corresponding `@types/` is not needed. Note, since typing are only used before compilation, the typing are not needed in the production build and they should always be in the dev dependencies of the `package.json`.

# Interface

In typescript we can define the "shape" of an object using the `interface` keyword. For example we could have the following:
```typescript
interface MultiplyValues {
  value1: number;
  value2: number;
}
```
This means that the return value should be an object with two properties `value1` and `value2`, which are both of type `number`.

# Alternative array syntax

We can define arrays in typescript in two following ways:
1. `let values: number[];`
2. `let values: Array<number>;`

# Any type

The type `any` specifies that a variable can be of any type. It disables type checking when you use this keyword. In typescript, every untyped variable whose type cannot be inferred implicitly becomes of type `any`. We can either explicitly define the `any` type, or it is implicitly inferred. However implicitly inferring types are considered problematic since it is often due to the coder not specifying any types. If we configure the rule `noImplicitAny` on the compiler level, then we can avoid this issue.

# Type assertion

Type assertion is another way to keep the typescript compiler and eslint quiet. For example we can export the type Operation in `calculator.ts`:
```typescript
export type Operation = 'multiply' | 'add' | 'divide';
```
Now we can import the type and use the type assertion as to tell the typescript compiler what type a variable has:
```typescript
import { calculator, Operation } from './calculator';

app.post('/calculate', (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { value1, value2, op } = req.body;

  // validate the data here

  // assert the type

  const operation = op as Operation;


  const result = calculator(Number(value1), Number(value2), operation);

  return res.send({ result });
});
```
The defined constant operation has no the type Operation and the compiler is perfectly happy, no quieting of the eslint rule is needed on the following function call. Using a type assertion (or quieting in eslint rule) is always risky. It leaves the typescript compiler off the hook, the compiler just trusts that we as developers know what we are doing. If the asserted tpye does not have the right kind of value, the result will be a runtime error, so one must be careful when validating the data if a type assertion is used.
