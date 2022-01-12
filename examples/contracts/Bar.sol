// SPDX-License-Identifier: WTFPL
pragma solidity 0.8.9;

contract Bar {
    @start<Non-immutable>
    uint256 public foo;

    constructor(uint256 foo_) {
        foo = foo_;
    }
    @end

    @start<Immutable>
    uint256 immutable public foo;

    constructor(uint256 foo_) {
        foo = foo_;
    }
    @end
}
