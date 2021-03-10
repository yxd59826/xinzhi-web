<template>
  <div class="app-container">
    <div class="head-container">
      <div style="margin-bottom: 10px;">
        <el-input v-model="memberQuery.id" class="filter-item" style="width: 150px;" placeholder="会员ID" clearable />
        <el-input v-model="memberQuery.username" class="filter-item" style="width: 150px;" placeholder="账号" clearable />
        <el-input v-model="memberQuery.phone" class="filter-item" style="width: 150px;" placeholder="手机" clearable />
        <el-input v-model="memberQuery.email" class="filter-item" style="width: 250px;" placeholder="邮箱" clearable />
        <el-select v-model="memberQuery.date_type" class="filter-item" style="width:110px;" placeholder="日期类型" clearable>
          <el-option value="create_time" label="注册时间" />
          <el-option value="login_time" label="登录时间" />
          <el-option value="update_time" label="更新时间" />
        </el-select>
        <el-date-picker
          v-model="memberQuery.date_range"
          type="daterange"
          class="filter-item"
          style="width: 240px;"
          range-separator="-"
          value-format="yyyy-MM-dd"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
        <el-button class="filter-item" type="success" icon="el-icon-search" @click="memberSearch()">查询</el-button>
        <el-button class="filter-item" type="warning" icon="el-icon-refresh-left">重置</el-button>
      </div>
      <div class="crud-opts">
        <el-button
          class="filter-item"
          type="primary"
          size="mini"
          icon="el-icon-plus"
          @click="memberAdd()"
        >
          新增
        </el-button>
      </div>
    </div>
    <el-table v-loading="loading" :data="memberData" style="width: 100%">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="ID" align="center" />
      <el-table-column prop="username" label="用户名" width="180" align="center" />
      <el-table-column prop="nickname" label="昵称" align="center" />
      <el-table-column prop="avatar" label="头像" align="center">
        <template slot-scope="scope">
          <el-avatar :size="48" :src="scope.row.avatar" v-if="scope.row.avatar"></el-avatar>
          <el-avatar icon="el-icon-user-solid" v-else></el-avatar>
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="手机" min-width="120" sortable="custom" show-overflow-tooltip align="center" />
      <el-table-column prop="email" label="邮箱" min-width="220" sortable="custom" show-overflow-tooltip align="center" />
      <el-table-column prop="create_time" label="注册时间" min-width="160" sortable="custom" align="center" />
      <el-table-column prop="login_time" label="登录时间" min-width="160" sortable="custom" align="center" />
      <el-table-column prop="remark" label="备注" min-width="110" show-overflow-tooltip align="center" />
      <el-table-column prop="sort" label="排序" width="80" sortable="custom" align="center" />
      <el-table-column prop="is_disable" label="禁用" min-width="80" sortable="custom" align="center" fixed="right">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.is_disable" :active-value="1" :inactive-value="0" @change="memberIsProhibit(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="210" align="center" fixed="right">
        <template slot-scope="{ row }">
          <el-button size="mini" type="primary" @click="memberPassword(row)">密码</el-button>
          <el-button size="mini" type="success" @click="memberModify(row)">修改</el-button>
          <el-button size="mini" type="danger" @click="memberDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="memberCount > 0"
      :total="memberCount"
      :page.sync="memberQuery.page"
      :limit.sync="memberQuery.limit"
      @pagination="memberList"
    />
    <el-dialog :title="memberDialogTitle" :visible.sync="memberDialog" :before-close="memberCancel" width="600px">
      <el-form ref="memberRef" :inline="true" :model="memberModel" :rules="memberRules" class="dialog-body" size="small" label-width="66px">
        <el-form-item v-if="memberModel.id" label="头像" prop="avatar">
          <el-col :span="10">
            <el-avatar shape="circle" :size="100" :src="memberModel.avatar" v-if="memberModel.avatar"/>
            <el-avatar icon="el-icon-user-solid" :size="100" v-else></el-avatar>
          </el-col>
          <el-col class="line" :span="4" style="text-align:center" />
          <el-col :span="14">
            <el-upload
              name="avatar_file"
              :show-file-list="false"
              :before-upload="uploadBefore"
              :action="uploadAction"
              :headers="uploadHeaders"
              :data="uploadData"
              :on-success="uploadSuccess"
            >
              <el-button>更换头像</el-button>
            </el-upload>
            <span>jpg、png图片，小于100KB，宽高1:1</span>
          </el-col>
        </el-form-item>
        <el-form-item label="账号" prop="username">
          <el-input key="username" v-model="memberModel.username" placeholder="请输入账号" clearable />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input key="nickname" v-model="memberModel.nickname" placeholder="请输入昵称" clearable />
        </el-form-item>
        <el-form-item v-if="memberModel.id == undefined" label="密码" prop="password">
          <el-input key="password" v-model="memberModel.password" placeholder="请输入密码" clearable show-password />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="memberModel.email" clearable />
        </el-form-item>
        <el-form-item label="手机" prop="phone">
          <el-input v-model="memberModel.phone" clearable />
        </el-form-item>
        <el-form-item label="地区" prop="region_id">
          <el-cascader v-model="memberModel.region_id" :options="regionTree" :props="regionProps" placeholder="" style="width:100%" @change="regionChange" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="memberModel.remark" clearable />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input v-model="memberModel.sort" type="number" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="memberCancel">取消</el-button>
        <el-button type="primary" @click="memberSubmit">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import { getAdminUserId, getToken } from '@/utils/auth'
import {
  memberList,
  memberAdd,
  memberEdit,
  memberDisable
} from '@/api/member'

export default {
  name: 'Member',
  components: { Pagination },
  data() {
    return {
      memberData: [],
      memberCount: 0,
      memberQuery: {
        page: 1,
        limit: 13
      },
      loading: false,
      memberDialog: false,
      memberDialogTitle: '',
      memberModel: {
        id: undefined,
        username: '',
        nickname: '',
        password: '',
        email: '',
        phone: '',
        region_id: '',
        avatar: '',
        remark: '',
        sort: 10000,
        login_region: ''
      },
      regionTree: [],
      regionProps: {
        expandTrigger: 'click',
        checkStrictly: true,
        value: 'region_id',
        label: 'region_name'
      },
      memberRules: {
        username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      },
      uploadAction: process.env.VUE_APP_BASE_API + '/admin/Member/memberAvatar',
      uploadHeaders: {
        AdminToken: getToken(),
        AdminUserId: getAdminUserId()
      },
      uploadData: { id: undefined }
    }
  },
  created() {
    this.memberList()
  },
  methods: {
    memberList() {
      this.loading = true
      memberList(this.memberQuery).then(res => {
        this.memberData = res.data.list
        this.memberCount = res.data.count
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    // 会员地区选择
    regionChange(value) {
      if (value) {
        this.memberModel.region_id = value[value.length - 1]
      }
    },
    uploadBefore(file) {
      this.uploadData.id = this.memberModel.id
    },
    uploadSuccess(res, file) {
      if (res.code === 200) {
        this.memberModel.avatar = res.data.avatar
        this.$message.success(res.msg)
      } else {
        this.$message.error(res.msg)
      }
    },
    memberIsProhibit(row) {
      this.loading = true
      memberDisable(row).then(res => {
        this.memberList()
        this.$message.success(res.msg)
      }).catch(() => {
        this.memberList()
      })
    },
    memberSearch() {
      this.memberQuery.page = 1
      this.memberList()
    },
    memberAdd() {
      this.memberDialog = true
      this.memberDialogTitle = '会员添加'
      this.memberModelReset()
    },
    memberModelReset() {
      this.memberModel = this.$options.data().memberModel
    },
    memberCancel() {
      this.memberModelReset()
      this.memberDialog = false
    },
    memberModify(row) {
      this.memberDialog = true
      this.memberDialogTitle = '会员修改：' + row.username
      this.memberModel = row
    },
    // 会员添加、修改提交
    memberSubmit() {
      this.$refs['memberRef'].validate(valid => {
        if (valid) {
          this.loading = true
          if (this.memberModel.id) {
            memberEdit(this.memberModel).then(res => {
              this.memberList()
              this.memberDialog = false
              this.$message.success(res.msg)
            }).catch(() => {
              this.loading = false
            })
          } else {
            memberAdd(this.memberModel).then(res => {
              this.memberList()
              this.memberDialog = false
              this.$message.success(res.msg)
            }).catch(() => {
              this.loading = false
            })
          }
        }
      })
    }
  }
}
</script>

<style scoped>
  .filter-item{margin-right: 8px;}
</style>
