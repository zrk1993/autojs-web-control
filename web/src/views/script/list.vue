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
      <el-table-column label="脚本ID" align="center">
        <template slot-scope="scope">{{ scope.row.script_id }}</template>
      </el-table-column>
      <el-table-column label="脚本名称" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.script_name }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="create_time" label="创建时间">
        <template slot-scope="scope">
          <i class="el-icon-time" />
          <span>{{ scope.row.create_time | time }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="update_time" label="更新时间">
        <template slot-scope="scope">
          <i class="el-icon-time" />
          <span>{{ scope.row.update_time | time }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-popover v-model="scope.row.visible" placement="top" width="120">
            <p class="tac">您确定删除吗？</p>
            <div class="tac m0">
              <el-button size="mini" type="text" @click="scope.row.visible = false">取消</el-button>
              <el-button type="primary" size="mini" @click="removeScript(scope.row.script_id)">确定</el-button>
            </div>
            <el-button slot="reference" type="danger" icon="el-icon-delete" circle size="mini" />
          </el-popover>

          <el-button
            class="ml5"
            type="primary"
            icon="el-icon-edit"
            circle
            size="mini"
            @click="editScript(scope.row.script_id)"
          />
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
      return status ? "success" : "gray";
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
        url: "/script/get_script_list",
        method: "get",
        params: {}
      }).then(res => {
        this.list = res.data.scripts;
        this.listLoading = false;
      });
    },
    editScript(id) {
      this.$router.push({ path: "/develop/index", query: { id }});
    },
    removeScript(id) {
      this.listLoading = true;
      request({
        url: "/script/remove_script",
        method: "post",
        data: { script_id: id }
      }).then(res => {
        this.fetchData();
        this.listLoading = false;
      });
    }
  }
};
</script>
