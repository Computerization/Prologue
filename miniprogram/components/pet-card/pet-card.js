const { getStatusConfig } = require('../../utils/util')

Component({
  properties: {
    pet: {
      type: Object,
      value: {}
    }
  },
  observers: {
    'pet.status': function (status) {
      if (status) {
        this.setData({ statusConfig: getStatusConfig(status) })
      }
    }
  },
  data: {
    statusConfig: { text: '', color: '#999', bgColor: '#f5f5f5' }
  },
  methods: {
    onTap: function () {
      const pet = this.properties.pet
      if (pet && pet._id) {
        wx.navigateTo({ url: '/pages/detail/detail?id=' + pet._id })
      }
    }
  }
})
