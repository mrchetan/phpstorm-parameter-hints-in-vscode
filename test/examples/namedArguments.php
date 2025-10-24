<?php

function greet(string $name, string $greeting = "Hello", int $times = 1) {
    for ($i = 0; $i < $times; $i++) {
        echo "$greeting, $name!\n";
    }
}

// Traditional positional arguments
greet("John", "Hi", 2);

// Named arguments in order
greet(name: "Jane", greeting: "Hey", times: 3);

// Named arguments in different order
greet(greeting: "Howdy", name: "Bob", times: 1);

// Named arguments mixed order
greet(name: "Alice", times: 2, greeting: "Greetings");

// Only some named arguments
greet(name: "Charlie");

// Mixed positional and named arguments
greet("Dave", greeting: "Aloha");
