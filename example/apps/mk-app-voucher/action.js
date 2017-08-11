import React from 'react'
import ReactDOM from 'react-dom'
import { action as MetaAction, AppLoader } from 'mk-meta-engine'
import config from './config'
import { Input, DataGrid, DatePicker, Select } from 'mk-component'
import { Map } from 'immutable'
import moment from 'moment'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        injections.reduce('init')
        this.load()
    }

    load = async () => {
        const response = await this.webapi.editableTable.query()
        this.injections.reduce('load', response)
    }

    save = async () => {
        var form = this.metaAction.gf('data.form').toJS()
        console.log(form)
        //this.metaAction.toast('success', '保存成功')
        //this.load()
    }

    focus = (e) => {
        debugger
        console.log(e)
    }


    addrow = (ps) => {
        this.injections.reduce('addEmptyRow', ps.rowIndex + 1)
    }

    delrow = (ps) => {
        const list = this.metaAction.gf('data.list')
        const id = list.getIn([ps.rowIndex, 'id'])
        this.injections.reduce('delrow', id)
    }

    isFocusCell = (ps, columnKey) => {
        const focusCellInfo = this.metaAction.gf('data.other.focusCellInfo')
        if (!focusCellInfo)
            return false
        return focusCellInfo.columnKey == columnKey && focusCellInfo.rowIndex == ps.rowIndex
    }


    mobileChange = (ps) => (v) => {
        this.metaAction.sf(`data.list.${ps.rowIndex}.mobile`, v)
    }

    birthdayChange = (ps) => (v) => {
        this.metaAction.sf(`data.list.${ps.rowIndex}.birthday`, v)
    }

    sexChange = (ps) => (v) => {
        if (!v) {
            this.metaAction.sf(`data.list.${ps.rowIndex}.sex`, undefined)
            return
        }


        this.metaAction.sf(`data.list.${ps.rowIndex}.sex`, v == 0
            ? Map({ value: 0, text: '男' })
            : Map({ value: 1, text: '女' })
        )
    }

    cellClick = (ps, columnKey) => (e) => {
        e.stopPropagation()

        this.metaAction.sf('data.other.focusCellInfo', { rowIndex: ps.rowIndex, columnKey })

        if (columnKey == 'name') {
            setTimeout(() => {
                const dom = ReactDOM.findDOMNode(this.refName)
                dom.select()
            }, 0)
        }
        else if (columnKey == 'mobile')
            setTimeout(() => {
                const dom = ReactDOM.findDOMNode(this.refMobile)
                dom.select()
            }, 0)


    }

    cellGetter = (columnKey) => (ps) => {
        var cellValue = this.metaAction.gf(`data.form.details.${ps.rowIndex}.${columnKey}`)
        var showValue = cellValue

        if (columnKey == 'birthday') {
            showValue = cellValue ? cellValue.format('YYYY-MM-DD') : cellValue
        }

        if (!this.isFocusCell(ps, columnKey)) {
            return (
                <DataGrid.TextCell
                    onClick={this.cellClick(ps, columnKey)}
                    value={showValue}
                />
            )
        }

        if (columnKey == 'name') {
            return (
                <Input
                    className='mk-app-voucher-cell'
                    onChange={(e) => this.metaAction.sf(`data.form.details.${ps.rowIndex}.name`, e.target.value)}
                    value={cellValue}
                    ref={o => this.refName = o}
                />
            )
        }
        else if (columnKey == 'mobile') {
            return (
                <Input.Number
                    className='mk-app-voucher-cell'
                    onChange={this.mobileChange(ps)}
                    value={cellValue}
                    ref={o => this.refMobile = o}
                />
            )
        }

        else if (columnKey == 'birthday') {
            return (
                <DatePicker
                    className='mk-app-voucher-cell'
                    onChange={this.birthdayChange(ps)}
                    value={moment(cellValue)}
                />
            )
        }

        else if (columnKey == 'sex') {
            return (
                <Select
                    className='mk-app-voucher-cell'
                    allowClear
                    onChange={this.sexChange(ps)}
                    value={cellValue ? cellValue.get('value') + '' : undefined}
                >
                    <Option value="0">男</Option>
                    <Option value="1">女</Option>
                </Select>
            )
        }
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}