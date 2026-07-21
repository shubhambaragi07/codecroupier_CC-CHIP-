import axios from "axios";
import { SUBGRAPH_URL } from "../config/subgraph";

const request = async (query) => {

    const res = await axios.post(SUBGRAPH_URL, { query });

    if (res.data.errors) {
        console.log(res.data.errors);
        throw new Error(res.data.errors[0].message);
    }

    return res.data.data;

};

export async function getDepositHistory(address){

const query=`

{

deposits(

first:500

orderBy:time

orderDirection:desc

where:{

user:"${address.toLowerCase()}"

}

){

id

amount

totalDeposit

time

referrer

transactionHash

}

}

`;

const data=await request(query);

return data.deposits;

}

export async function getROIHistory(address){

const query = `
{
  roiclaims(
    first:5
    orderBy: time
    orderDirection: desc
    where:{
      user:"${address.toLowerCase()}"
    }
  ){
    totalroi
    finalroi
    levelIncomePaid
    time
    transactionHash
  }
}
`;

const data = await request(query);

return data.roiclaims;
}

export async function getWithdrawHistory(address){

const query=`

{

withdraws(

first:5

orderBy:time

orderDirection:desc

where:{

user:"${address.toLowerCase()}"

}

){

amount

fee

netAmount

time

transactionHash

}

}

`;

const data=await request(query);

return data.withdraws;

}

export async function getLevelIncome(address){

const query=`

{

levelIncomes(

first:500

orderBy:time

orderDirection:desc

where:{

to:"${address.toLowerCase()}"

}

){

from

level

amount

time

transactionHash

}

}

`;

const data=await request(query);

return data.levelIncomes.map(item=>({

...item,

amount:Number(item.amount)/10**18,

date:new Date(Number(item.time)*1000).toLocaleString()

}));

}

export async function getRewardHistory(address) {

const query = `

{
  rewardClaims(
    first:20
    orderBy:time
    orderDirection:desc
    where:{
      user:"${address.toLowerCase()}"
    }
  ){

    rewardId
    amount
    time
    transactionHash

  }
}

`;

const data = await request(query);

return data.rewardClaims;

}

export async function getRewardAchieved(address){

const query=`

{
  rewardAchieveds(
    first:20
    where:{
      user:"${address.toLowerCase()}"
    }
  ){

    rewardId
    rewardAmount
    time

  }
}

`;

const data=await request(query);

return data.rewardAchieveds;

}

export async function getDirectIncome(address){

const query=`

{
  directIncomes(
    first:20
    orderBy:time
    orderDirection:desc
    where:{
      to:"${address.toLowerCase()}"
    }
  ){

    from
    amount
    time
    transactionHash

  }
}

`;

const data=await request(query);

return data.directIncomes;

}

export async function getDashboard(address) {

const query = `
{
  user(id:"${address.toLowerCase()}"){

    id
    totalDeposit
    directIncome
    levelIncome
    roiIncome
    rewardIncome
    totalIncome
    teamBusiness
    directCount
    totalIncomeWithdrawn
    rewardWithdrawn

  }
}
`;

const data = await request(query);

return data.user ?? null;

}

export async function getRewardWithdrawHistory(address){

const query=`

{
  rewardWithdraws(
    first:500
    orderBy:time
    orderDirection:desc
    where:{
      user:"${address.toLowerCase()}"
    }
  ){
    amount
    fee
    netAmount
    time
    transactionHash
  }
}

`;

const data=await request(query);

return data.rewardWithdraws.map(item=>({

    ...item,

    amount:Number(item.amount)/1e18,

    fee:Number(item.fee)/1e18,

    netAmount:Number(item.netAmount)/1e18,

    date:new Date(Number(item.time)*1000).toLocaleString()

}));

}


export async function getDirectMembers(address){

const query = `
{
  userRegistereds(
    where:{
      referrer:"${address.toLowerCase()}"
    }
  ){
    user
  }
}
`;

const data = await request(query);

return data.userRegistereds;
}

export async function getTotalDownline(address){

    const directs = await getDirectMembers(address);

    let total = directs.length;

    for(const member of directs){

        total += await getTotalDownline(member.user);

    }

    return total;
}

/**
 * Fetch ALL user registrations from the subgraph (with pagination support).
 * Returns an array of { user, referrer } objects.
 */
export async function getAllUserRegistrations() {
    let allRegs = [];
    let skip = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
        const query = `
        {
            userRegistereds(
                first: ${pageSize}
                skip: ${skip}
                orderBy: time
                orderDirection: asc
            ){
                user
                referrer
                time
            }
        }
        `;
        const data = await request(query);
        if (data.userRegistereds && data.userRegistereds.length > 0) {
            allRegs = allRegs.concat(data.userRegistereds);
            skip += pageSize;
            if (data.userRegistereds.length < pageSize) hasMore = false;
        } else {
            hasMore = false;
        }
    }

    return allRegs;
}

/**
 * Fetch user details (deposit, teamBusiness, directCount) from subgraph for multiple addresses.
 * Uses the subgraph's `user` entity.
 */
export async function getUsersDetails(addresses) {
    if (!addresses || addresses.length === 0) return [];

    // Batch in chunks of 500 to avoid query size limits
    const batchSize = 500;
    const results = [];

    for (let i = 0; i < addresses.length; i += batchSize) {
        const batch = addresses.slice(i, i + batchSize);
        const formatted = batch.map(a => `"${a.toLowerCase()}"`).join(",");

        const query = `
        {
            users(
                where: { id_in: [${formatted}] }
            ){
                id
                totalDeposit
                teamBusiness
                directCount
            }
        }
        `;

        const data = await request(query);
        if (data.users) {
            results.push(...data.users);
        }
    }

    return results;
}

/**
 * Build a complete referral tree from all user registrations.
 * Returns an object: { [address]: { referrer, children: [addresses] } }
 */
function buildReferralTree(registrations) {
    const tree = {};

    // Initialize tree nodes
    for (const reg of registrations) {
        const addr = reg.user.toLowerCase();
        if (!tree[addr]) {
            tree[addr] = { referrer: reg.referrer ? reg.referrer.toLowerCase() : null, children: [] };
        }
    }

    // Build parent-child relationships
    for (const reg of registrations) {
        const addr = reg.user.toLowerCase();
        const referrer = reg.referrer ? reg.referrer.toLowerCase() : null;
        if (referrer && tree[referrer]) {
            tree[referrer].children.push(addr);
        }
    }

    return tree;
}

/**
 * Get all members at a specific level (depth) in the referral tree under the given root address.
 * Level 1 = directs, Level 2 = directs of directs, etc.
 */
function getMembersAtLevel(tree, root, targetLevel, currentLevel = 1) {
    if (currentLevel > targetLevel) return [];

    const rootNode = tree[root];
    if (!rootNode) return [];

    if (currentLevel === targetLevel) {
        return [...rootNode.children];
    }

    // Go deeper through children
    const members = [];
    for (const child of rootNode.children) {
        const deeper = getMembersAtLevel(tree, child, targetLevel, currentLevel + 1);
        members.push(...deeper);
    }
    return members;
}

/**
 * Get all members from level 1 to maxLevel under the root, with level info.
 */
function getAllLevelMembers(tree, root, maxLevel = 15) {
    const levels = [];

    for (let level = 1; level <= maxLevel; level++) {
        const members = getMembersAtLevel(tree, root, level);
        levels.push({
            level,
            count: members.length,
            members
        });
    }

    return levels;
}

/**
 * Process the tree to compute aggregate stats per level.
 * Returns level summary with deposit sums, team business sums, and downline counts.
 */
function computeLevelSummaries(levels, userDetailsMap) {
    return levels.map(levelInfo => {
        const { level, members } = levelInfo;
        let totalDeposit = 0;
        let totalTeamBusiness = 0;
        let totalDownlineCount = 0;

        for (const memberAddr of members) {
            const details = userDetailsMap[memberAddr];
            if (details) {
                totalDeposit += Number(details.totalDeposit || 0);
                totalTeamBusiness += Number(details.teamBusiness || 0);
                totalDownlineCount += Number(details.directCount || 0);
            }
        }

        return {
            level,
            count: members.length,
            totalDeposit: totalDeposit,
            totalTeamBusiness: totalTeamBusiness,
            totalDownline: totalDownlineCount,
            members
        };
    });
}

/**
 * Main function: Get levels summary (Levels 1-15) for a given user address.
 * Returns array of { level, count, totalDeposit, totalTeamBusiness, totalDownline, members }
 */
export async function getLevelsSummary(address) {
    if (!address) return [];

    try {
        // Get all registrations
        const registrations = await getAllUserRegistrations();

        // Build the tree
        const tree = buildReferralTree(registrations);

        const rootAddr = address.toLowerCase();

        // If user not found in tree, return empty
        if (!tree[rootAddr]) return [];

        // Get all members for levels 1-15
        const levelsData = getAllLevelMembers(tree, rootAddr, 15);

        // Collect all unique member addresses across all levels for batch fetching
        const allAddresses = [];
        const addrSet = new Set();
        for (const levelInfo of levelsData) {
            for (const member of levelInfo.members) {
                if (!addrSet.has(member)) {
                    addrSet.add(member);
                    allAddresses.push(member);
                }
            }
        }

        // Batch fetch user details from subgraph
        const userDetails = await getUsersDetails(allAddresses);

        // Build a map for quick lookup
        const userDetailsMap = {};
        for (const detail of userDetails) {
            userDetailsMap[detail.id.toLowerCase()] = detail;
        }

        // Compute summaries
        const summaries = computeLevelSummaries(levelsData, userDetailsMap);

        return summaries;

    } catch (error) {
        console.error("Error fetching levels summary:", error);
        return [];
    }
}

/**
 * Get detailed member info for a specific level.
 * Returns array of { wallet, deposit, teamBusiness, directs }
 */
export async function getLevelMembers(address, level) {
    if (!address || level < 1) return [];

    try {
        const registrations = await getAllUserRegistrations();
        const tree = buildReferralTree(registrations);
        const rootAddr = address.toLowerCase();

        if (!tree[rootAddr]) return [];

        const memberAddresses = getMembersAtLevel(tree, rootAddr, level);
        if (memberAddresses.length === 0) return [];

        // Fetch user details
        const userDetails = await getUsersDetails(memberAddresses);

        const detailsMap = {};
        for (const detail of userDetails) {
            detailsMap[detail.id.toLowerCase()] = detail;
        }

        // Format member data
        return memberAddresses.map((addr, index) => {
            const detail = detailsMap[addr] || {};
            return {
                wallet: addr,
                deposit: detail.totalDeposit ? Number(detail.totalDeposit) / 1e18 : 0,
                teamBusiness: detail.teamBusiness ? Number(detail.teamBusiness) / 1e18 : 0,
                directs: detail.directCount ? Number(detail.directCount) : 0
            };
        });

    } catch (error) {
        console.error(`Error fetching level ${level} members:`, error);
        return [];
    }
}

export default request;
