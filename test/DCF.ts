
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { network } from "hardhat";
import { parseEther } from "viem";

describe("DCF Contract", function () {
    async function deployDCF() {
        const { viem } = await network.create();

        const [owner, user, anotherUser] =
            await viem.getWalletClients();

        const dcf = await viem.deployContract("DCF");

        return { dcf, owner, user, anotherUser };
    }

    // =========================================
    // 1. OWNER AND ACCESS CONTROL TESTS
    // =========================================

    it("should set the deployer as the owner", async function () {
        const { dcf, owner } = await deployDCF();

        const contractOwner = await dcf.read.owner();

        assert.equal(
            contractOwner.toLowerCase(),
            owner.account.address.toLowerCase()
        );
    });

    it("should initially mark a person as unauthorized", async function () {
        const { dcf, user } = await deployDCF();

        const authorized = await dcf.read.isAuthorized([
            user.account.address,
        ]);

        assert.equal(authorized, false);
    });

    it("should allow the owner to add a person", async function () {
        const { dcf, owner, user } = await deployDCF();

        await dcf.write.addPerson([user.account.address], {
            account: owner.account,
        });

        const authorized = await dcf.read.isAuthorized([
            user.account.address,
        ]);

        assert.equal(authorized, true);
    });

    it("should allow the owner to remove a person", async function () {
        const { dcf, owner, user } = await deployDCF();

        await dcf.write.addPerson([user.account.address], {
            account: owner.account,
        });

        await dcf.write.removePerson([user.account.address], {
            account: owner.account,
        });

        const authorized = await dcf.read.isAuthorized([
            user.account.address,
        ]);

        assert.equal(authorized, false);
    });

    it("should reject addPerson when called by a non-owner", async function () {
        const { dcf, user, anotherUser } = await deployDCF();

        await assert.rejects(
            dcf.write.addPerson([anotherUser.account.address], {
                account: user.account,
            })
        );
    });

    it("should reject removePerson when called by a non-owner", async function () {
        const { dcf, owner, user, anotherUser } =
            await deployDCF();

        await dcf.write.addPerson([anotherUser.account.address], {
            account: owner.account,
        });

        await assert.rejects(
            dcf.write.removePerson([anotherUser.account.address], {
                account: user.account,
            })
        );
    });

    it("should allow the owner to call restrictedFunction", async function () {
        const { dcf, owner } = await deployDCF();

        const result = await dcf.read.restrictedFunction({
            account: owner.account,
        });

        assert.equal(result, "Access granted");
    });

    it("should reject restrictedFunction when called by a non-owner", async function () {
        const { dcf, user } = await deployDCF();

        await assert.rejects(
            dcf.read.restrictedFunction({
                account: user.account,
            })
        );
    });

    // =========================================
    // 2. DEPOSIT ACCESS TESTS
    // =========================================

    it("should allow the owner to deposit ETH", async function () {
        const { dcf, owner } = await deployDCF();

        const amount = parseEther("1");

        await dcf.write.deposit({
            account: owner.account,
            value: amount,
        });

        const deposited = await dcf.read.getDepositsOf([
            owner.account.address,
        ]);

        assert.equal(deposited, amount);
    });

    it("should allow an authorized person to deposit ETH", async function () {
        const { dcf, owner, user } = await deployDCF();

        await dcf.write.addPerson([user.account.address], {
            account: owner.account,
        });

        const amount = parseEther("0.5");

        await dcf.write.deposit({
            account: user.account,
            value: amount,
        });

        const deposited = await dcf.read.getDepositsOf([
            user.account.address,
        ]);

        assert.equal(deposited, amount);
    });

    it("should reject deposits from an unauthorized person", async function () {
        const { dcf, user } = await deployDCF();

        await assert.rejects(
            dcf.write.deposit({
                account: user.account,
                value: parseEther("0.1"),
            })
        );
    });

    it("should reject a zero-value deposit", async function () {
        const { dcf, owner } = await deployDCF();

        await assert.rejects(
            dcf.write.deposit({
                account: owner.account,
                value: 0n,
            })
        );
    });

    it("should reject deposits after authorization is removed", async function () {
        const { dcf, owner, user } = await deployDCF();

        await dcf.write.addPerson([user.account.address], {
            account: owner.account,
        });

        await dcf.write.removePerson([user.account.address], {
            account: owner.account,
        });

        await assert.rejects(
            dcf.write.deposit({
                account: user.account,
                value: parseEther("0.1"),
            })
        );
    });

    // =========================================
    // 3. DEPOSIT ACCOUNTING TESTS
    // =========================================

    it("should record multiple deposits from the same person", async function () {
        const { dcf, owner } = await deployDCF();

        await dcf.write.deposit({
            account: owner.account,
            value: parseEther("1"),
        });

        await dcf.write.deposit({
            account: owner.account,
            value: parseEther("0.5"),
        });

        const deposited = await dcf.read.getDepositsOf([
            owner.account.address,
        ]);

        assert.equal(deposited, parseEther("1.5"));
    });

    it("should return the caller's own deposits", async function () {
        const { dcf, owner, user } = await deployDCF();

        await dcf.write.addPerson([user.account.address], {
            account: owner.account,
        });

        await dcf.write.deposit({
            account: user.account,
            value: parseEther("0.25"),
        });

        const deposited = await dcf.read.getMyDeposits({
            account: user.account,
        });

        assert.equal(deposited, parseEther("0.25"));
    });

    it("should track total deposits from multiple people", async function () {
        const { dcf, owner, user } = await deployDCF();

        await dcf.write.addPerson([user.account.address], {
            account: owner.account,
        });

        await dcf.write.deposit({
            account: owner.account,
            value: parseEther("1"),
        });

        await dcf.write.deposit({
            account: user.account,
            value: parseEther("0.5"),
        });

        const total = await dcf.read.getTotalDeposited();

        assert.equal(total, parseEther("1.5"));
    });

    it("should return the contract's actual ETH balance", async function () {
        const { dcf, owner } = await deployDCF();

        const amount = parseEther("0.75");

        await dcf.write.deposit({
            account: owner.account,
            value: amount,
        });

        const balance = await dcf.read.getContractBalance();

        assert.equal(balance, amount);
    });

    it("should return zero deposits for a person who has not deposited", async function () {
        const { dcf, user } = await deployDCF();

        const deposited = await dcf.read.getDepositsOf([
            user.account.address,
        ]);

        assert.equal(deposited, 0n);
    });
});
