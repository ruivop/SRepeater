# SRepeater

This program repeats strings, using annotations. This was first developed to create scripts to do repetitive CRUD operations on a database (like populating it).
The main features of this program include:
* for loops to repeat string
* inputting arrays of strings
* creating random numbers and strings and storing them in variables to show them later

I tried to do a visual editor (like an IDE) [here](https://ruivop.github.io/SRepeater/).

## Annotations

$#$ number in sequence
$#.R.0.100$ random number between [0,100]
$#.R.0.100.var1$ random number between [0,100] and store it in vaiable var1
$v.var1$ the value of var1
$a.#$ the value of the element of the number in sequence 
$c.#.R.0.50.var1$ creates a context that repeats a random number of times, and stores it in var1

## Examples
### input:
Hello World!

###output:
Hello World!


### input:
$C #.5$
Hello World!
$EC$

### output:

Hello World!

Hello World!

Hello World!

Hello World!

Hello World!


### input:
$C #.5 v.var1$
Hello World $V v.var1$!
$EC$

### output:

Hello World 0!

Hello World 1!

Hello World 2!

Hello World 3!

Hello World 4!

