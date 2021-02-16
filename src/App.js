import React, { Component } from 'react';
import { Button, Input, Table, message } from 'antd';
import 'antd/dist/antd.css';
const { Search } = Input;

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      importData: [],
      importSheet: 'Sheet1',
      importKey: '产品型号',
      importValue: '保护带Model'
    }
  }

  componentDidMount() {
    window.electron.ipcRenderer.send('load');
    window.electron.ipcRenderer.on('load-reply', (event, arg) => {
      const tmp = arg.tmp;
      if (tmp) {
        this.setState({
          data: tmp,
          importData: tmp
        })
      } 
    });
    window.electron.ipcRenderer.on('import-reply', (event, arg) => {
      if (arg) {
        message.info('Import Completed');
        window.electron.ipcRenderer.send('load');
      } else {
        message.error('Import Error');
      }
    })
  }

  render() {
    return (
      <div >
        <div style={{ width: "100%", marginTop: "20px", marginLeft: "20px", marginRight: "20px" }}>
          <Search
            style={{ width: "830px" }}
            placeholder="Input Search Text"
            allowClear
            enterButton="Search"
            size="large"
            onChange={this.onChangeSearch.bind(this)}
            onSearch={this.onSearchID.bind(this)}
          />
        </div>
        <div style={{ width: "100%", marginTop: "10px", marginLeft: "20px", marginRight: "20px" }}>
          <Input
            style={{ width: "200px" }}
            placeholder="Input Import Sheet  Name"
            value={this.state.importSheet}
            onChange={this.onChangeImportSheet.bind(this)}
          />
          <Input
            style={{ width: "200px", marginLeft: "10px" }}
            placeholder="Input Import Sheet Key"
            value={this.state.importKey}
            onChange={this.onChangeImportKey.bind(this)}
          />
          <Input
            style={{ width: "200px", marginLeft: "10px" }}
            placeholder="Input Import Sheet Value"
            value={this.state.importValue}
            onChange={this.onChangeImportValue.bind(this)}
          />
          <Button
            style={{ width: "200px", marginLeft: "10px" }}
            onClick={this.onClickImport.bind(this)}
          >
            Import Excel
          </Button>

        </div>

        <Table
          style={{ width: "830px", marginTop: "10px", marginLeft: "20px", marginRight: "20px" }}
          columns={[{ title: 'Key', dataIndex: 'k', key: 'k' }, { title: 'Value', dataIndex: 'v', key: 'v' }]}
          dataSource={this.state.importData} />


      </div>
    )
  }

  onSearchID(value) {
    if (value) {
      const tmp = this.state.data.filter(o => {
        return o.k.indexOf(value) !== -1;
      })
      this.setState({
        importData: tmp
      })
      console.log(value)
    } else {
      window.electron.ipcRenderer.send('load');
    }
  }

  onChangeSearch(e) {
    const value = e.target.value;
    console.log(value)
    if (value) {
      const tmp = this.state.data.filter(o => {
        return o.k.indexOf(value) !== -1;
      })
      this.setState({
        importData: tmp
      })
      console.log(value)
    } else {
      window.electron.ipcRenderer.send('load');
    }
  }

  onChangeImportSheet(e) {
      this.setState({
        importSheet: e.target.value
      })
    
  }

  onChangeImportKey(e) {
      this.setState({
        importKey: e.target.value
      })
    
  }

  onChangeImportValue(e) {
      this.setState({
        importValue: e.target.value
      })
    
  }

  onClickImport() {
    const importSheet = this.state.importSheet;
    const importKey = this.state.importKey;
    const importValue = this.state.importValue;
    if(importSheet && importKey && importValue){
      window.electron.ipcRenderer.send('import', importSheet, importKey, importValue);
    } else{
      message.warn('Please Input Sheet && Key && Value !')
    }
  }
}
export default App;
