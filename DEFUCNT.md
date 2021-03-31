
For wildcard-replace statements, the following are true:

 * `_` in `search` matches any single character.
 * `*` in `search` matches one or more characters.
 * `_(N)` in `wildcard-replace` refers to the `N`th matched single character.
 * `*(N)` in `wildcard-replace` refers to the `N`th matched multi-character string.
 * The `k`-th mention of `_` in `wildcard-replace` refers to `_(k)`. Similar behavior for `*` in `wildcard-replace`.