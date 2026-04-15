const PetStatus = {
  AVAILABLE: '可领养',
  RESERVED: '已预定',
  ADOPTED: '已领养'
}

const ApplicationStatus = {
  PENDING: '待审核',
  APPROVED: '已通过',
  REJECTED: '已拒绝'
}

const Species = {
  CAT: '猫',
  DOG: '狗',
  OTHER: '其他'
}

const Gender = {
  MALE: '公',
  FEMALE: '母',
  UNKNOWN: '未知'
}

const MaxPhotos = 9
const NavigateBackDelay = 1500
const PhoneLength = 11
const QueryLimitAdmin = 100
const QueryLimitUser = 50

module.exports = {
  PetStatus,
  ApplicationStatus,
  Species,
  Gender,
  MaxPhotos,
  NavigateBackDelay,
  PhoneLength,
  QueryLimitAdmin,
  QueryLimitUser
}
