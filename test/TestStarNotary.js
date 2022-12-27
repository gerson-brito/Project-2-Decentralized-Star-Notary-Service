const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:98854});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    assert.equal(
        balanceOfUser2BeforeTransaction > balanceAfterUser2BuysStar,
        true
      );
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    let tokenId =10;
    let instance = await StarNotary.deployed();
    await instance.createStar('New Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.name(), 'Rita Gerson Token');
    assert.equal(await instance.symbol(), 'RGT');
});

it('lets 2 users exchange stars', async() => {
    let tokenId1 = 11;
    let tokenId2 = 12;
    let instance = await StarNotary.deployed();
    await instance.createStar('New star1!', tokenId1, {from: accounts[1]});
    await instance.createStar('New star2!', tokenId2, {from: accounts[2]});
    await instance.approve(accounts[1], tokenId2, {from: accounts[2]});
    assert.equal(await instance.ownerOf(tokenId1), accounts[1]);
    assert.equal(await instance.ownerOf(tokenId2), accounts[2]);
    await instance.exchangeStars(tokenId1, tokenId2, {from: accounts[1]});
    assert.equal(await instance.ownerOf(tokenId1), accounts[2]);
    assert.equal(await instance.ownerOf(tokenId2), accounts[1]);
});

it('lets a user transfer a star', async() => {
    let tokenId1 = 13;
    let instance = await StarNotary.deployed();
    await instance.createStar('New star3!', tokenId1, {from: accounts[1]});
    assert.equal(await instance.ownerOf(tokenId1), accounts[1]);
    await instance.transferStar(accounts[2], tokenId1, {from: accounts[1]});
    assert.equal(await instance.ownerOf(tokenId1), accounts[2]);
});

it('lookUptokenIdToStarInfo test', async() => {
    let tokenId = 14;
    let instance = await StarNotary.deployed();
    await instance.createStar('New star4!', tokenId, {from: accounts[0]})
    assert.equal(await instance.lookUptokenIdToStarInfo(tokenId), 'New star4!');
});