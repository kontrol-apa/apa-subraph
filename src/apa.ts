import { Address, BigInt, ByteArray, Bytes, json, JSONValue, log} from "@graphprotocol/graph-ts"
import {
  APA,
  Transfer,
  Approval
} from "../generated/APA/APA"
import { ApaInfo, CatchUpHelper } from "../generated/schema"
import {apaOffchainData} from "./off-chain";
let apaOffchainDataList = json.fromString(apaOffchainData).toArray();


export function handleApproval(event: Approval): void {
    catchUp(event.address);
 }

 export function handleApprovalForAll(event: Approval): void {
  catchUp(event.address);
}

export function handleTransfer(event: Transfer): void {
  catchUp(event.address);
  let apaInfo = ApaInfo.load(Bytes.fromByteArray(ByteArray.fromBigInt(event.params.tokenId)));
  if(apaInfo) {
    apaInfo.owner = event.params.to; // is this possible TODO
    apaInfo.save();
  }
  else {
    setApaInfo(event.params.to,event.params.tokenId);
  }
}

function catchUp(contractAddy : Address): void {
  if(!contractAddy.equals(Address.fromString('0x880Fe52C6bc4FFFfb92D6C03858C97807a900691'))) { // no catch up on test net!
    return;
  }
  let catchUpEntity = CatchUpHelper.load(Bytes.fromByteArray(ByteArray.fromUTF8("Helper")));
  let lastSyncedTokenId = 0;
  let batchSize = 100;
  const collectionSize = 10047;
  if(catchUpEntity) {
    if(catchUpEntity.syncCompleted) {
      return;
    }
    lastSyncedTokenId = catchUpEntity.lastSyncedTokenId;
    catchUpEntity.lastSyncedTokenId += batchSize;
  }
  else {
    catchUpEntity = new CatchUpHelper(Bytes.fromByteArray(ByteArray.fromUTF8("Helper")));
    catchUpEntity.lastSyncedTokenId = lastSyncedTokenId;
    catchUpEntity.syncCompleted = false;
  }
  log.debug("Here {}", ['lastSyncedTokenId']);
    
  if(lastSyncedTokenId + batchSize > collectionSize) {
    batchSize = collectionSize - lastSyncedTokenId;
    catchUpEntity.syncCompleted = true;

  }

  let APAContract = APA.bind(contractAddy);
  for (let index = lastSyncedTokenId; index < batchSize + lastSyncedTokenId; index++) {
    let apaInfo = ApaInfo.load(Bytes.fromByteArray(ByteArray.fromBigInt(BigInt.fromI32(index))));
    if(apaInfo){
      continue; // already synced by some other mean
    }
    const ownerAddy = APAContract.ownerOf(BigInt.fromI32(index));
    setApaInfo(ownerAddy,BigInt.fromI32(index));
  }
  catchUpEntity.save();
}

function setApaInfo(owner: Address, tokenId: BigInt): void {
  let apaInfo = new ApaInfo(Bytes.fromByteArray(ByteArray.fromBigInt(tokenId)));
  const tokenData = apaOffchainDataList[tokenId.toI32()];
  apaInfo.tokenId = tokenId;
  apaInfo.imageId = getNumberTrait(tokenData, 'imageId');
  apaInfo.rarity = getNumberTrait(tokenData, 'rarity');
  apaInfo.tokenId = getNumberTrait(tokenData, 'tokenId');
  apaInfo.owner = Bytes.fromHexString(owner.toHexString());
  apaInfo.save();
}


export function getNumberTrait(value: JSONValue, field: string): BigInt {
  return value
    .toObject()
    .get(field)!
    .toBigInt();
}
