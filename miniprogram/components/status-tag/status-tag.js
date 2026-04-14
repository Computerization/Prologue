const { getStatusConfig, getApplicationStatusConfig } = require('../../utils/util')

Component({
  properties: {
    status: {
      type: String,
      value: ''
    },
    type: {
      type: String,
      value: 'pet'
    }
  },
  observers: {
    'status, type': function (status, type) {
      if (status) {
        const config = type === 'application' ? getApplicationStatusConfig(status) : getStatusConfig(status)
        this.setData({ config })
      }
    }
  },
  data: {
    config: { text: '', color: '#999', bgColor: '#f5f5f5' }
  }
})
