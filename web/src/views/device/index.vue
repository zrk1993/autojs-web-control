<template>
  <div class="app-container">
    <el-table
      v-loading="listLoading"
      :data="$store.state.device.list"
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
          <el-button type="text" @click="changeName(scope.row.device_id)">{{ scope.row.name }}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="IP地址" align="center">
        <template slot-scope="scope">{{ scope.row.ip }}</template>
      </el-table-column>
      <el-table-column align="center" prop="create_time" label="创建时间">
        <template slot-scope="scope">
          <i class="el-icon-time" />
          <span>{{ scope.row.create_time | time }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="create_time" label="连接时间">
        <template slot-scope="scope">
          <i class="el-icon-time" />
          <span>{{ scope.row.connect_time | time }}</span>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="是否在线" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.is_online | statusFilter">{{ scope.row.is_online ? '在线' : '离线' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-popover v-model="scope.row.visible" placement="top" width="120">
            <p class="tac">您确定删除吗？</p>
            <div class="tac m0">
              <el-button size="mini" type="text" @click="scope.row.visible = false">取消</el-button>
              <el-button type="primary" size="mini" @click="removeDevice(scope.row.device_id)">确定</el-button>
            </div>
            <el-button slot="reference" type="danger" icon="el-icon-delete" circle size="mini" />
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import request from "@/utils/request";

export default {
  filters: {
    statusFilter(status) {
      return status ? "success" : "info";
    }
  },
  data() {
    return {
      list: null,
      listLoading: false
    };
  },
  methods: {
    changeName(device_id) {
      this.$prompt("请输入新的设备名称", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      })
        .then(({ value }) => {
          this.listLoading = true;
          request({
            url: "/device/update_device",
            method: "post",
            data: { device_id, name: value }
          }).then(res => {
            this.fetchData();
            this.listLoading = false;
          });
        });
    },
    removeDevice(id) {
      this.listLoading = true;
      request({
        url: "/device/remove_device",
        method: "post",
        data: { device_id: id }
      }).then(res => {
        this.listLoading = false;
      });
    }
  }
};
</script>
