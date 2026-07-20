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

export default request;