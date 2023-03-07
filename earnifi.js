const ethers = require('ethers');
const { Contract, Provider } = require('ethers-multicall');
const fs = require('fs');
const merkleTree = require('./merkle-tree');
const utils = require('./utils');

const transformFunc = v => ({
    account: v[0],
    token: v[1],
    claimable: ethers.BigNumber.from(v[2]),
});

(async () => {
    let initialDistFile = "trees/merkle-dist2.json.gz";
    let finalDistFile = "trees/merkle-dist23.json.gz";
    let provider = new ethers.providers.JsonRpcProvider("put your own rpc url here");
    let ethcallProvider = new Provider(provider);
    await ethcallProvider.init();

    let eulDistributor = new Contract(utils.EulDistributorAddr, ["function claimed(address, address) view returns (uint)"]);
    let initialDistribution = utils.loadMerkleDistFile(initialDistFile);
    let finalDistribution = utils.loadMerkleDistFile(finalDistFile);
    let initialItems = initialDistribution.values.map(transformFunc);
    let finalItems = finalDistribution.values.map(transformFunc);
    let accounts = initialItems.map(i => i.account);
    let claimed = await ethcallProvider.all(accounts.map(a => eulDistributor.claimed(a, utils.EulTokenAddr)));
    
    let result = {}
    for (let i = 0; i < accounts.length; i++) {
        if (initialItems[i].claimable.lte(claimed[i])) continue;
        
        result[accounts[i]] = {
            ...finalItems.find(item => item.account === accounts[i]),
            ...(() => {
                let proof = merkleTree.proof(finalItems, accounts[i], utils.EulTokenAddr);

                return {
                    claimable: proof.item.claimable.toString(),
                    proof: proof.witnesses.join(',')
                }
            })(),
            stake: ethers.constants.AddressZero,
        }
    }

    fs.writeFileSync('result.json', JSON.stringify(result, null, 2));
})();
