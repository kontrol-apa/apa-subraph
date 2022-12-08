import { BigInt } from "@graphprotocol/graph-ts"
import {
  APA,
  Approval,
  ApprovalForAll,
  Claim,
  OwnershipTransferred,
  Redeem,
  Transfer
} from "../generated/APA/APA"
import { ExampleEntity } from "../generated/schema"

export function handleApproval(event: Approval): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entity = ExampleEntity.load(event.transaction.from)

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (!entity) {
    entity = new ExampleEntity(event.transaction.from)

    // Entity fields can be set using simple assignments
    entity.count = BigInt.fromI32(0)
  }

  // BigInt and BigDecimal math are supported
  entity.count = entity.count + BigInt.fromI32(1)

  // Entity fields can be set based on event parameters
  entity.owner = event.params.owner
  entity.approved = event.params.approved

  // Entities can be written to the store with `.save()`
  entity.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.INITIAL_CLAIM_PRICE(...)
  // - contract.MAX_MINTABLE(...)
  // - contract.MAX_PER_CLAIM(...)
  // - contract.POST_5000_PRICE(...)
  // - contract.ROYALTY_VALUE(...)
  // - contract.airdropNumber(...)
  // - contract.balanceOf(...)
  // - contract.canClaim(...)
  // - contract.canClaimAirdrop(...)
  // - contract.getApproved(...)
  // - contract.getClaimedAirdrops(...)
  // - contract.getCurrentReward(...)
  // - contract.getImageIDs(...)
  // - contract.getNextBatchPrice(...)
  // - contract.getProjectedReward(...)
  // - contract.getRecognizedContracts(...)
  // - contract.getRewards(...)
  // - contract.givenRewards(...)
  // - contract.isApprovedForAll(...)
  // - contract.isContractRecognized(...)
  // - contract.minted(...)
  // - contract.name(...)
  // - contract.numHonoraries(...)
  // - contract.owner(...)
  // - contract.ownerOf(...)
  // - contract.post5000Extra(...)
  // - contract.royaltyInfo(...)
  // - contract.supportsInterface(...)
  // - contract.symbol(...)
  // - contract.tokenByIndex(...)
  // - contract.tokenOfOwnerByIndex(...)
  // - contract.tokenURI(...)
  // - contract.totalProjectedRewards(...)
  // - contract.totalSupply(...)
  // - contract.withdrawableBalance(...)
  // - contract.withdrawn(...)
}

export function handleApprovalForAll(event: ApprovalForAll): void {}

export function handleClaim(event: Claim): void {}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handleRedeem(event: Redeem): void {}

export function handleTransfer(event: Transfer): void {}
