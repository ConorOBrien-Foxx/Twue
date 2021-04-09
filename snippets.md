# Increment a decimal number

Increments all decimal numbers between `^` and `$`, leaving only the numbers.

```
^9$::=10
9$::=$0
8$::=9
7$::=8
6$::=7
5$::=6
4$::=5
3$::=4
2$::=3
1$::=2
0$::=1
^::=
::=
^34$ ^59$ ^0$ ^3999$ ^3949$ ^99$
^0$ ^1$ ^2$ ^3$ ^4$ ^5$ ^6$ ^7$ ^8$ ^9$ ^10$
```

# Decrement a decimal number (positive)

Decrements all decimal numbers between `^ and `$`, leaving only the numbers. Does not handle negative numbers, and leaves -1 as `$9`. This can be detected (before `^::=`) as `^$9`.

```
0$::=$9
9$::=8
8$::=7
7$::=6
6$::=5
5$::=4
4$::=3
3$::=2
2$::=1
^1$9::=^9
1$::=0
^::=
::=
^34$ ^59$ ^1$ ^3999$ ^3949$ ^300$
```

# Increment/decrement a decimal number (positive or negative)

```
NEGATIVE HANDLING::=
~!::=$
~$::=!
^-_::=-^_~
~_::=_~

INCREMENT RULES (^...$)::=
^9$::=10
9$::=$0
8$::=9
7$::=8
6$::=7
5$::=6
4$::=5
3$::=4
2$::=3
1$::=2
0$::=1

DECREMENT RULES (^...!)::=
0!::=!9
9!::=8
8!::=7
7!::=6
6!::=5
5!::=4
4!::=3
3!::=2
2!::=1
^1!9::=^9
1!::=0

FINAL CLEANUP::=
-^0::=0
^!9::=-1
^::=

::=
^-101$ ^-100$ ^-99$ ^-4$ ^-1$ ^49$ ^0$ ^1$ ^4$ ^9$ ^10$ ^100$ ^999$
^-100! ^-99! ^-4! ^-1! ^49! ^0! ^1! ^4! ^9! ^10! ^100! ^1100!
```

# Decimal to Unary

Repeats `x` by `^n$` times.

```^0$.::=
0$::=$9
9$::=8
8$::=7
7$::=6
6$::=5
5$::=4
4$::=3
3$::=2
2$::=1
^1$9::=^9
1$::=0
>.::=$.
>_::=_>
^::=x^>
::=
^23$.```

# Unary to Decimal

Converts a string of `x` starting with `_` to a decimal number.

```
^9$::=^10
9$::=$0
8$::=9
7$::=8
6$::=7
5$::=6
4$::=5
3$::=4
2$::=3
1$::=2
0$::=1
~x::=^0x
x::=$
^::=
::=
~xxxxxxxxxxxxxxxxxx
```