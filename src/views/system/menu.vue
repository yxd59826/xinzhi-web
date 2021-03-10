<template>
  <div class="app-container">
    <div class="head-container">
      <el-button
        class="filter-item"
        size="mini"
        type="primary"
        icon="el-icon-plus"
        @click="toAdd"
      >
        新增
      </el-button>
    </div>
    <el-table
      ref="table"
      v-loading="tableLoading"
      lazy
      size="mini"
      :load="getMenus"
      :data="menuData"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      row-key="admin_menu_id"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column :show-overflow-tooltip="true" label="菜单标题" width="225px" prop="title" />
      <el-table-column :show-overflow-tooltip="true" label="菜单别名" width="225px" prop="menu_name" />
      <el-table-column prop="menu_icon" label="图标" align="center" width="60px">
        <template slot-scope="scope">
          <i v-if="scope.row.menu_icon && scope.row.menu_icon.indexOf('el-icon') != -1" :class="scope.row.menu_icon" />
          <svg-icon v-else :icon-class="scope.row.menu_icon ? scope.row.menu_icon : ''" />
        </template>
      </el-table-column>
      <el-table-column prop="menu_sort" align="center" label="排序">
        <template slot-scope="scope">
          {{ scope.row.menu_sort }}
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" prop="component" label="组件路径" />
      <el-table-column prop="cache" label="缓存" width="75px">
        <template slot-scope="scope">
          <span v-if="scope.row.cache">否</span>
          <span v-else>是</span>
        </template>
      </el-table-column>
      <el-table-column prop="hidden" label="可见" width="75px">
        <template slot-scope="scope">
          <span v-if="scope.row.hidden">否</span>
          <span v-else>是</span>
        </template>
      </el-table-column>
      <el-table-column prop="create_time" label="创建日期" width="135px" />
      <el-table-column label="操作" align="center" fixed="right" width="155px">
        <template slot-scope="{ row }">
          <el-button size="small" type="success" @click="menuModify(row)">修改</el-button>
          <el-button size="small" type="danger" @click="menuDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog append-to-body :close-on-click-modal="false" :visible.sync="menuDialog" :title="menuDialogTitle" width="580px">
      <el-form ref="menuRef" :inline="true" :model="form" :rules="rules" size="small" label-width="80px">
        <el-form-item label="菜单类型" prop="type">
          <el-radio-group v-model="form.type" size="mini" style="width: 178px">
            <el-radio-button label="0">目录</el-radio-button>
            <el-radio-button label="1">菜单</el-radio-button>
            <el-radio-button label="2">按钮</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-show="form.type.toString() !== '2'" label="菜单图标" prop="icon">
          <el-popover
            placement="bottom-start"
            width="450"
            trigger="click"
            @show="$refs['iconSelect'].reset()"
          >
            <IconSelect ref="iconSelect" @selected="selected" />
            <el-input slot="reference" v-model="form.menu_icon" style="width: 450px;" placeholder="点击选择图标">
              <svg-icon v-if="form.menu_icon" slot="prefix" :icon-class="form.menu_icon" class="el-input__icon" style="height: 32px;width: 16px;" />
              <i v-else slot="prefix" class="el-icon-search el-input__icon" />
            </el-input>
          </el-popover>
        </el-form-item>
        <el-form-item v-show="form.type.toString() !== '2'" label="外链菜单" prop="iframe">
          <el-radio-group v-model="form.iframe" size="mini">
            <el-radio-button label="1">是</el-radio-button>
            <el-radio-button label="0">否</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-show="form.type.toString() === '1'" label="菜单缓存" prop="cache">
          <el-radio-group v-model="form.cache" size="mini">
            <el-radio-button label="1">是</el-radio-button>
            <el-radio-button label="0">否</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-show="form.type.toString() !== '2'" label="菜单可见" prop="hidden">
          <el-radio-group v-model="form.hidden" size="mini">
            <el-radio-button label="1">是</el-radio-button>
            <el-radio-button label="0">否</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.type.toString() !== '2'" label="菜单标题" prop="title">
          <el-input v-model="form.title" :style=" form.type.toString() === '0' ? 'width: 450px' : 'width: 178px'" placeholder="菜单标题" />
        </el-form-item>
        <el-form-item label="菜单别名" prop="menu_name">
          <el-input v-model="form.menu_name" placeholder="匹配语言包" style="width: 178px;" />
        </el-form-item>
        <el-form-item v-if="form.type.toString() === '2'" label="按钮名称" prop="title">
          <el-input v-model="form.title" placeholder="按钮名称" style="width: 178px;" />
        </el-form-item>
        <el-form-item v-show="form.type.toString() !== '0'" label="权限标识" prop="permission">
          <el-input v-model="form.permission" placeholder="权限标识" style="width: 178px;" />
        </el-form-item>
        <el-form-item v-if="form.type.toString() !== '2'" label="路由地址" prop="path">
          <el-input v-model="form.path" placeholder="路由地址" style="width: 178px;" />
        </el-form-item>
        <el-form-item label="菜单排序" prop="menu_sort">
          <el-input-number v-model.number="form.menu_sort" :min="0" :max="999" controls-position="right" style="width: 178px;" />
        </el-form-item>
        <el-form-item v-show="!form.iframe && form.type.toString() === '1'" label="组件路径" prop="component">
          <el-input v-model="form.component" style="width: 178px;" placeholder="组件路径" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="menuCancel">取消</el-button>
        <el-button type="primary" @click="menuSubmit">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import IconSelect from '@/components/IconSelect'
import { menuList, menuEdit, menuAdd } from '@/api/admin'
export default {
  name: 'Menu',
  components: { IconSelect },
  data() {
    return {
      menuData: [],
      tableLoading: false,
      menuDialog: false,
      menuDialogTitle: '',
      rules: {
        menu_name: [
          { required: true, message: '请输入别名', trigger: 'blur' }
        ],
        title: [
          { required: true, message: '请输入标题', trigger: 'blur' }
        ],
        path: [
          { required: true, message: '请输入地址', trigger: 'blur' }
        ]
      },
      form: {
        admin_menu_id: undefined,
        type: '',
        menu_name: '',
        title: '',
        menu_icon: '',
        iframe: undefined,
        hidden: undefined,
        path: '',
        cache: undefined,
        component: '',
        menu_sort: undefined
      }
    }
  },
  created() {
    this.getMenuList()
  },
  methods: {
    getMenuList() {
      this.loading = true
      menuList().then(res => {
        this.menuData = res.data.list
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    menuModify(row) {
      this.menuDialog = true
      this.menuDialogTitle = '菜单修改：' + row.menu_name
      this.form = row
    },
    getMenus(tree, treeNode, resolve) {
      setTimeout(() => {
        const params = { pid: tree.admin_menu_id }
        menuList(params).then(res => {
          resolve(res.data.list)
        }).catch(() => {
          this.loading = false
        })
      }, 100)
    },
    // 选中图标
    selected(name) {
      this.form.menu_icon = name
    },
    // 菜单添加、修改取消
    menuCancel() {
      this.menuDialog = false
      this.resetForm()
    },
    toAdd() {
      this.menuDialog = true
      this.menuDialogTitle = '菜单添加'
      this.resetForm()
    },
    resetForm() {
      this.form = {
        admin_menu_id: undefined,
        type: '',
        menu_name: '',
        title: '',
        menu_icon: '',
        iframe: undefined,
        hidden: undefined,
        path: '',
        cache: undefined,
        component: '',
        menu_sort: undefined
      }
      this.$nextTick(() => {
        this.$refs['menuRef'].clearValidate()
      })
    },
    menuSubmit() {
      this.$refs['menuRef'].validate(valid => {
        if (valid) {
          this.loading = true
          if (this.form.admin_menu_id) {
            menuEdit(this.form, 'post').then(res => {
              this.menuDialog = false
              this.getMenuList()
              this.$message.success(res.msg)
              this.resetForm()
            }).catch(() => {
              this.loading = false
            })
          } else {
            menuAdd(this.form).then(res => {
              this.menuDialog = false
              this.getMenuList()
              this.$message.success(res.msg)
              this.resetForm()
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

</style>
