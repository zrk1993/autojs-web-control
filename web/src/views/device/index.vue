<template>
  <div class="app-container">
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="设备ID" align="center">
        <template slot-scope="scope">{{ scope.row.device_id }}</template>
      </el-table-column>
      <el-table-column label="设备名称" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.device_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="设备连接码" align="center">
        <template slot-scope="scope">{{ scope.row.connect_code }}</template>
      </el-table-column>
      <el-table-column class-name="status-col" label="是否在线" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.is_online | statusFilter">{{ scope.row.is_online }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="create_time" label="创建时间">
        <template slot-scope="scope">
          <i class="el-icon-time" />
          <span>{{ scope.row.create_time }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import request from '@/utils/request';

export default {
  filters: {
    statusFilter(status) {
      return status ? 'success' : 'gray';
    }
  },
  data() {
    return {
      list: null,
      listLoading: true
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      this.listLoading = true;
      request({
        url: '/device/get_device_list',
        method: 'get',
        params: {}
      }).then(res => {
        this.list = res.data.devices;
        this.listLoading = false;
      });
    }
  }
};
</script>
