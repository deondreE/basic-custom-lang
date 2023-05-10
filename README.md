# Basic Programming Lang

Looks like this:

```js
fib = λ(n) if n < 2 then n else fib(n - 1) + fib(n - 2);

print("fib(10): ");
time( λ() println(fib(10)) );
print("fibJS(10): ");
time( λ() println(fibJS(10)) );

println("---");

print("fib(20): ");
time( λ() println(fib(20)) );
print("fibJS(20): ");
time( λ() println(fibJS(20)) );

println("---");

print("fib(27): ");
time( λ() println(fib(27)) );
print("fibJS(27): ");
time( λ() println(fibJS(27)) );
```