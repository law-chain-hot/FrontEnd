import React, { Component } from 'react';
// import "react-table/react-table.css";
// import "./styles.css";
// import ReactTable from "react-table";
import { Tab, Table, Button, Menu, Icon, Pagination } from 'semantic-ui-react'
import './index.css';
import { api } from 'utils'
import _ from 'lodash'
import Papa from 'papaparse'
// import {XYPlot, LineSeries, VerticalGridLines, HorizontalGridLines, XAxis, YAxis, VerticalBarSeries, HorizontalBarSeries, LabelSeries} from 'react-vis'
var fileDownload = require('js-file-download')



export default class Keywords extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            offeringId : props.offeringId,
            search: [],
        }
    }

    componentDidMount(){
        const{offeringId} = this.props
        api.getOfferingSearchHistory(offeringId)
            .then(({data}) => {
                this.setState({search: data})
                console.log("---------search", data)
                console.log("---------search.data", data[0].term)
            })
    }

    render(){
        const search = this.state
        const panes = [
            { menuItem: 'Chart', render:() => <SearchChart search={search} />},
            { menuItem: 'Table', render:() => <SearchTable search={search}/>}
        ]
        return (
            <div className="searchTotal">
                <p>TOP 5 SEARCH KEYWORDS</p>
                <hr></hr>
                <Tab menu={{secondary: true, pointing: true }} panes={panes}/>
            </div>
        )
    }
}

function SearchChart({ search }) {
    const searchdata = _.sortBy(search, 'count').reverse()
    // const search1 = searchdata
    return (
        <div className="circles">
            <div className="upCircles">
                <div className="circle2"> 
                    <p>{searchdata[0].count} </p> 
                </div>
                <div className="circle1"> hahaha </div>
                <div className="circle5">  </div>
            </div> 

            <div className="downCircles">
                <div className="circle3"> </div>
                <div className="circle4">  </div>
            </div>
        </div>
    );
}

export class SearchTable extends Component {
    constructor(props) {
        super(props)
        this.state = {

        }
    }


    onDownload = () => {
        const { search } = this.props
        const csvStr = Papa.unparse(search)
        fileDownload(csvStr, 'SearchKeywords-Table.csv')
    }


    render() {
        const { search } = this.props
        return (
        <div className = 'SearchOuter'>
            <div className = 'SearchTable1'>
                <Button content="Download" onClick={this.onDownload} primary>
                </Button>

                <Table sortable celled unstackable>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell collapsing>
                                Index
                            </Table.HeaderCell>
            
                            <Table.HeaderCell>
                                Term
                            </Table.HeaderCell>
                            <Table.HeaderCell>
                                Count
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                    {
                        search.map(( words, index) => 
                            <Table.Row key={words.term}>
                                <Table.Cell>{index + 1}</Table.Cell>
                                <Table.Cell>{words.term}</Table.Cell>
                                <Table.Cell>{words.count}</Table.Cell>
                            </Table.Row>
                        )
                    }
                    </Table.Body>
                </Table>
            </div>
        </div>);
    }
}

