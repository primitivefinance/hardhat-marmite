// SPDX-License-Identifier: GPL-3.0-only
pragma solidity 0.8.9;

contract Foo {
    uint256 public foo;

    function boop(uint256 bar) external {
        @start:Foo
        foo = bar;
        @end

        @start:Bar
        foo = 0;
        foo = bar;
        @end

        @start:Beep
        foo = 0;
        foo = bar;
        foo = 0;
        foo = bar;
        @end

        @start:Yay
        foo = 0;
        foo = bar;
        foo = 0;
        foo = bar;
        foo = 0;
        foo = bar;
        @end
    }
}
