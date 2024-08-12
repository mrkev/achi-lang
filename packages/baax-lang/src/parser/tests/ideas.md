# Match, for, if expressions evaluate to broken value

```
function foo() {
  const result = match (foo) {
    case 1: break 'foo';  // result = 'foo'
    case 2: break 'bar';  // result = 'bar
    case 3: return 'baz'; // returns function
  }

  const result = for (let i = 0; i < 2; i++) {
    if (foo) {
      break 3;  // result = 3
    } else {
      return 3; // returns function
    }
  }

  // actually maybe these no, nust loops and match
  const result = if (foo == 3) {
    somethingElse();
    break 3;  // result = 3
  } else {
    return 3; // returns function
  }
}
```

class Lion()
class Tiger()
class Elephant()

type Animal =
| Lion
| Tiger
| Elephant

enum Animal = {
Lion
Tiger
Elephant
}

union card {
class King();
class Queen();
class Jack();
class Number(value: number);
}

union status {
"this"
(a: number, b: number) => string
(a: number, b: number) => boolean
(foo: number) => string
number
}

match card with {
King =>
Queen =>
Jack =>
Number(value)
}

match x with {
"this" => {

};

x as ((a: number, b: number) => string) => {

};

x: ((a: number, b: number) => \_)) => {

}

x: (_ => _) {

}

x: number {

}

}

type card =
| class King()
| class Queen()
| class Jack()
| class Number(value: number)

class Point(
x: number,
y: number,
) methods (
add: () => {

},

...Point_extra,
...Point_more,
...Point_etc,
)

const one = 1;
const point = Point(x: one, y: 2);

#log point

\*/
