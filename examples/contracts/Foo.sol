// SPDX-License-Identifier: WTFPL
pragma solidity 0.8.9;

contract Foo {
    uint256 public bar;

    function set(uint256 newBar) external {
        @start:Different-from
        if (newBar != 0) {
            bar = newBar;
        }
        @end

        @start:Greater-than
        if (newBar > 0) {
            bar = newBar;
        }
        @end
    }
}
