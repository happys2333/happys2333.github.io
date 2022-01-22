<style scoped>
.layout {
  border: 1px solid #d7dde4;
  background: #f5f7f9;
  position: relative;
  border-radius: 4px;
  overflow: hidden;
}

.layout-logo {
  width: 100px;
  height: 30px;
  background: #f5f7f9;
  border-radius: 3px;
  float: left;
  position: relative;
  top: 15px;
  left: 20px;
}

.layout-nav {
  width: 420px;
  margin: 0 auto;
  margin-right: 20px;
}

.layout-footer-center {
  text-align: center;
}
</style>
<template>
  <div class="layout">
    <Layout>
      <Header>
        <Menu mode="horizontal" theme="dark" active-name="1" width="auto">
          <MenuItem name="1">
            <Icon type="ios-paper"/>
            主页
          </MenuItem>
          <MenuItem name="2">
            <Icon type="logo-octocat"/>
            编程心得
          </MenuItem>
          <MenuItem name="3">
            <Icon type="ios-person"/>
            关于我
          </MenuItem>
          <div id="language" style="text-align:right;">
            <Select style="width:15vh" placeholder="切换语言">
              <Option v-for="item in languages" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </div>
        </Menu>
      </Header>
      <Layout :style="{padding: '0 50px'}">
        <Breadcrumb :style="{margin: '10px 0'}">
        </Breadcrumb>
        <Content :style="{padding: '24px 0', minHeight: '80vh', background: '#fff'}">
          <Layout>
            <div id="page1" v-if="page1">

            </div>
            <div id="page2" v-if="page2">
              <Sider hide-trigger :style="{background: '#fff'}">
                <Menu theme="light">
                  <Submenu name="1">
                    <template slot="title">
                      <Icon type="ios-paper"/>
                      内容管理
                    </template>
                    <MenuItem name="1-1">文章管理</MenuItem>
                    <MenuItem name="1-2">评论管理</MenuItem>
                    <MenuItem name="1-3">举报管理</MenuItem>
                  </Submenu>
                  <Submenu name="2">
                    <template slot="title">
                      <Icon type="ios-people"/>
                      用户管理
                    </template>
                    <MenuItem name="2-1">新增用户</MenuItem>
                    <MenuItem name="2-2">活跃用户</MenuItem>
                  </Submenu>
                  <Submenu name="3">
                    <template slot="title">
                      <Icon type="ios-stats"/>
                      统计分析
                    </template>
                    <MenuGroup title="使用">
                      <MenuItem name="3-1">新增和启动</MenuItem>
                      <MenuItem name="3-2">活跃分析</MenuItem>
                      <MenuItem name="3-3">时段分析</MenuItem>
                    </MenuGroup>
                    <MenuGroup title="留存">
                      <MenuItem name="3-4">用户留存</MenuItem>
                      <MenuItem name="3-5">流失用户</MenuItem>
                    </MenuGroup>
                  </Submenu>
                </Menu>
              </Sider>
              <Content :style="{padding: '24px', minHeight: '280px', background: '#fff'}">
                Content
              </Content>
            </div>
            <div id="page3" v-if="page3">

            </div>

          </Layout>
        </Content>
      </Layout>
      <Footer class="layout-footer-center">2021-2021 &copy; Happys</Footer>
    </Layout>
  </div>
</template>
<script>
export default {
  data() {
    return {
      languages: [
        {
          value: 'Chinese',
          label: '中文'
        },
        {
          value: 'English',
          label: 'English'
        }
      ], page1: true,
      page2: false,
      page3: false
    }
  },created() {
    function changePage(i) {
        switch(parseInt(i))
        {
          case 1:
            {
              
            }
        }
    }
  }
}

</script>
