# Twue: A Thue Derivative

The original: https://esolangs.org/wiki/Thue

## Problem Statement

Thue is a language that, while novel, has noticeable flaws and criticisms. Most notably, there are certain ill-defined and poorly construed constructs in the language, such as newline-handling and I/O, that substantially detract from the overall language. **Twue** seeks to solve as many of the issues with the original as possible, while offering some convenient syntactic features which should make writing programs less menial.

## Key differences

Twue maintains the original core rule-rewriting statement:

```
search::=replace
```

Unlike its parent language, however, Twue is **not** random by default; it will deterministically iterate through each rule, and make the replacement if possible, before restarting at the beginning.

Furthermore, since Twue aims to enhance the range of potential operations, it introduces **escaping**, where `\` now can indicate the start of a special character, a familiar construct in many programming languages. Newlines can now be entered as `\n` and will be handled smoothly. The following escapes are defined:

 * `\n` - newline
 * `\t` - tab
 * `\xNN` - ascii character at hex 0xNN.
 * `\uNNNN` - unicode character at hex 0xNNNN.
 * `\\` - backslash
 * `\e` - the empty string

Additional, Twue also offers a variety of other rule-rewriting statement forms.

```
search::>replace-input
search::~output
```

The replace-input statement looks at the the RHS, and performs some replacements:

 * `.` gets replaced by a single character of STDIN.
 * `*` gets replaced by a line of STDIN, including a trailing newline.

The original functionality of, say, `@::=:::`, would become `@::>*`. This statement form should give programmers more control over the input, how its handled, and when its taken.

Next, output is a simple command that emulates the original `::=~` pseudocommand. Its behavior is to replace the first instance of `search` with an empty string, and output the string `output`, with no trailing newline. If a trailing newline is desired, it can be added manually with `\n`.

### Wildcards

Available in all rule-rewriting forms are the following wildcards. The desire is not to reduce Twue to a Regular Expression parser; the aim is to introduce minor quality of life changes for general programming.

 * `_` simply matches any character. Once matched, `_` will refer to characters of the same kind. In general, use `_N` to match N separate characters.
 * `[A-Z]` is an example of a character class; it simply matches anything inside.

## Example Programs

### Wildcard Demonstration
```
_$::=$._
::=
hello$
```

Outputs: `$.h.e.l.l.o`.

### Output workspace

```
_$$::~_
_$::=_$$$
::=
This is something that should be outputted.$
```

### Swap around

```
_|__::=

a|b
```

### Cat program

Reads bytes until EOF (0x00) is hit.

```
\x00@::=
@::>.@
```