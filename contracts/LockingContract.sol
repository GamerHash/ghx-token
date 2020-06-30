// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Lockable.sol";


contract LockingContract is Ownable, Lockable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    event TokensLocked();
    event TokensReleased(uint256 releaseAmount);

    IERC20 private _token;
    address private _beneficiary;
    uint256 private _releasedAmount;

    uint256 private _start;
    uint256 private _cliffDuration;
    uint256 private _cliffAmount;
    uint256 private _numSteps;
    uint256 private _stepDuration;
    uint256 private _stepAmount;

    constructor(address token, address beneficiary) public {
        require(token != address(0), "LockingContract: token is the zero address");
        require(beneficiary != address(0), "LockingContract: beneficiary is the zero address");
        _token = IERC20(token);
        _beneficiary = beneficiary;
    }

    modifier onlyBeneficiary() {
        require(_beneficiary == msg.sender, "LockingContract: caller is not the beneficiary");
        _;
    }

    function lockTokens(
        uint256 start,
        uint256 cliffDuration,
        uint256 cliffAmount,
        uint256 numSteps,
        uint256 stepDuration,
        uint256 stepAmount
    ) public onlyOwner whenNotLocked
    {
        require(start.add(cliffDuration) > now, "LockingContract: cliff end time is before current time");
        require(cliffDuration > 0, "LockingContract: cliffDuration is 0");
        require(cliffAmount > 0, "LockingContract: cliffAmount is 0");
        require(numSteps > 0, "LockingContract: numSteps is 0");
        require(stepDuration > 0, "LockingContract: stepDuration is 0");
        require(stepAmount > 0, "LockingContract: stepAmount is 0");

        _start = start;
        _cliffDuration = cliffDuration;
        _cliffAmount = cliffAmount;
        _numSteps = numSteps;
        _stepDuration = stepDuration;
        _stepAmount = stepAmount;

        _token.safeTransferFrom(msg.sender, address(this), _totalAmount());
        _lock();
        emit TokensLocked();
    }

    function releaseTokens() public onlyBeneficiary whenLocked {
        require(_releasedAmount < _totalAmount(), "LockingContract: all tokens released");

        uint256 unlockedAmount = _unlockedAmount();
        require(unlockedAmount > 0, "LockingContract: called before cliff end");

        uint256 releasableAmount = unlockedAmount.sub(_releasedAmount);
        require(releasableAmount > 0, "LockingContract: called before current step end");

        _transferTokens(releasableAmount);
    }

    function token() public view returns (IERC20) {
        return _token;
    }

    function beneficiary() public view returns (address) {
        return _beneficiary;
    }

    function releasedAmount() public view returns (uint256) {
        return _releasedAmount;
    }

    function _totalAmount() internal view returns (uint256) {
        return _cliffAmount.add(_stepAmount.mul(_numSteps));
    }

    function _unlockedAmount() internal view returns (uint256) {
        uint256 cliffEnd = _start.add(_cliffDuration);
        if (now < cliffEnd) {
            return 0;
        } else if (now >= cliffEnd.add(_stepDuration.mul(_numSteps))) {
            return _totalAmount();
        } else {
            uint256 unlockedSteps = now.sub(cliffEnd).div(_stepDuration);
            return _cliffAmount.add(_stepAmount.mul(unlockedSteps));
        }
    }

    function _transferTokens(uint256 amount) internal {
        _releasedAmount = _releasedAmount.add(amount);
        _token.safeTransfer(_beneficiary, amount);
        emit TokensReleased(amount);
    }
}