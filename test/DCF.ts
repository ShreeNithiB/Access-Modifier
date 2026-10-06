import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { network } from "hardhat";

describe("DCF Contract", function () {
    async function deployDCF() {
        const { viem } = await network.create();

        const [owner, user] = await viem.getWalletClients();

        const dcf = await viem.deployContract("DCF");

        return { dcf, owner, user };
    }

    it("should set the deployer as the owner", async function () {
        const { dcf, owner } = await deployDCF();

        const contractOwner = await dcf.read.owner();

        assert.equal(
            contractOwner.toLowerCase(),
            owner.account.address.toLowerCase()
        );
    });

    it("should initially mark a person as unauthorized", async function () {
        const { dcf } = await deployDCF();

        const person = "0x0000000000000000000000000000000000000001";

        const authorized = await dcf.read.isAuthorized([person]);

        assert.equal(authorized, false);
    });

    it("should allow the owner to add a person", async function () {
        const { dcf, owner } = await deployDCF();

        const person = "0x0000000000000000000000000000000000000001";

        await dcf.write.addPerson([person], {
            account: owner.account,
        });

        const authorized = await dcf.read.isAuthorized([person]);

        assert.equal(authorized, true);
    });

    it("should allow the owner to remove a person", async function () {
        const { dcf, owner } = await deployDCF();

        const person = "0x0000000000000000000000000000000000000001";

        await dcf.write.addPerson([person], {
            account: owner.account,
        });

        await dcf.write.removePerson([person], {
            account: owner.account,
        });

        const authorized = await dcf.read.isAuthorized([person]);

        assert.equal(authorized, false);
    });

    it("should allow the owner to call restrictedFunction", async function () {
        const { dcf, owner } = await deployDCF();

        const result = await dcf.read.restrictedFunction({
            account: owner.account,
        });

        assert.equal(result, "Access granted");
    });

    it("should reject addPerson when called by a non-owner", async function () {
        const { dcf, user } = await deployDCF();

        const person = "0x0000000000000000000000000000000000000001";

        await assert.rejects(
            dcf.write.addPerson([person], {
                account: user.account,
            })
        );
    });

    it("should reject removePerson when called by a non-owner", async function () {
        const { dcf, owner, user } = await deployDCF();

        const person = "0x0000000000000000000000000000000000000001";

        await dcf.write.addPerson([person], {
            account: owner.account,
        });

        await assert.rejects(
            dcf.write.removePerson([person], {
                account: user.account,
            })
        );
    });

    it("should reject restrictedFunction when called by a non-owner", async function () {
        const { dcf, user } = await deployDCF();

        await assert.rejects(
            dcf.read.restrictedFunction({
                account: user.account,
            })
        );
    });
});