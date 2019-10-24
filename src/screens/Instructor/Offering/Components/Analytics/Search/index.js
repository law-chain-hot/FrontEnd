import React, { Component, useState } from 'react';
import BubbleChart from '@weknow/react-bubble-chart-d3';
import { Tab, Table, Button, Menu, Icon, Dropdown } from 'semantic-ui-react'
import './index.css';
import { api } from 'utils'
import _ from 'lodash'
import Papa from 'papaparse'
// import ReactBubbleChart from 'react-bubble-chart';
// import {XYPlot, LineSeries, VerticalGridLines, HorizontalGridLines, XAxis, YAxis, VerticalBarSeries, HorizontalBarSeries, LabelSeries} from 'react-vis'
var fileDownload = require('js-file-download')


export default class Keywords extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            offeringId : props.offeringId,
            search: [],
            // result: []
        }
    }

    componentDidMount(){
        const{offeringId} = this.props
        api.getOfferingSearchHistory(offeringId)
            .then(({data}) => {
                this.setState({search: data.filter(word => Boolean(word.term))})
                console.log("---------search", data)
                console.log("---------search.data", data[0].term)
            })
    }

    render(){
        const {search} = this.state
        const panes = [
            { menuItem: 'Chart', render:() => <SearchChart search={search} />},
            { menuItem: 'Table', render:() => <SearchTable search={search}/>}
        ]
        return (
            <div className="searchTotal">
                <p>TOP SEARCH KEYWORDS (times)</p>
                <hr></hr>
                <Tab menu={{secondary: true, pointing: true }} panes={panes}/>
            </div>
        )
    }
}


// function SearchChart({ search }) {
//     console.log("===search", search[0])
//     return (
//         <div className="circles">
//             <div className="upCircles">
//             {
//                 search.length > 1
//                     &&
//                 <div className="circle2"> 
//                     <p> "{search[1].term}" </p> 
//                     <p1> {search[1].count} </p1> 
//                 </div>
//             }
//             {
//                 search.length > 0
//                     &&
//                 <div className="circle1"> 
//                     <p> "{search[0].term}" </p> 
//                     <p1> {search[0].count} </p1> 
//                 </div>
//             }
//             {
//                 search.length > 4
//                     &&
//                 <div className="circle5"> 
//                     <p> "{search[4].term}" </p> 
//                     <p1> {search[4].count} </p1> 
//                 </div>
//             }
//             </div> 
//             <div className="downCircles">
//             {
//                 search.length > 2
//                     &&
//                 <div className="circle3"> 
//                     <p> "{search[2].term}" </p> 
//                     <p1> {search[2].count} </p1> 
//                 </div>
//             }
//             {
//                 search.length > 3
//                     &&
//                 <div className="circle4"> 
//                     <p> "{search[3].term}" </p> 
//                     <p1> {search[3].count} </p1> 
//                 </div>
//             }
//             </div>
//             <Bubble width={250} height={80}>
//         Content Test
//       </Bubble>
//         {/* } */}
//         </div>
//     );
// }


export class SearchChart extends Component{
    constructor(props){
        super(props)
        this.state = {
            result: this.props.search.slice(0,10)
        }
    }

    componentDidUpdate(prevProps) {
        const { search } = this.props
        if (search !== prevProps.search) {
            this.setState({ result: search.slice(0, 10) })
        }
    }
    // bubbleClick = (label) =>{
    //     console.log("Custom bubble click func")
    // }
    // legendClick = (label) =>{
    //     console.log("Customer legend click func")
    // }
    handleClick = (numberOfBubbles) => () => {
        const {search} = this.props
        this.setState({result: search.slice(0, numberOfBubbles)})
    }  

    render(){
        const {result} = this.state
        console.log("now the result is", result)
        // const colorpicker = [{color: '#4266a3'},{color: '#f95d6a80'}]
        // console.log(colorpicker)
        const data1 = result.map(d => ({
            label: d.term,
            value: d.count,
            // color: colorpicker,
        }));

        return (
            <div className = "newchart">
                <Dropdown text='Top Search Keywords' button='true'>
                    <Dropdown.Menu>
                    <Dropdown.Item icon='circle outline' text='5' description='bubbles' onClick={this.handleClick(5)}/>
                    <Dropdown.Item icon='circle outline' text='10' description='bubbles' onClick={this.handleClick(10)}/>
                    <Dropdown.Item icon='circle outline' text='15' description='bubbles' onClick={this.handleClick(15)}/>
                    <Dropdown.Item icon='circle outline' text='20' description='bubbles' onClick={this.handleClick(20)}/>
                    </Dropdown.Menu>
                </Dropdown>
    
                <BubbleChart
                    graph= {{
                        zoom: 1,
                        offsetX: 0,
                        offsetY: 0,
                    }}
                    width={720}
                    height={600}
                    padding={0} // optional value, number that set the padding between bubbles
                    showLegend={true} // optional value, pass false to disable the legend.
                    legendPercentage={20} // number that represent the % of with that legend going to use.
                    legendFont={{
                        family: 'Arial',
                        size: 12,
                        color: '#000',
                        weight: 'bold',
                        }}
                    valueFont={{
                        family: 'Arial',
                        size: 12,
                        color: '#fff',
                        weight: 'bold',
                        }}
                    labelFont={{
                        family: 'Arial',
                        size: 12,
                        color: '#fff',
                        weight: 'bold',
                        }}
                    //Custom bubble/legend click functions such as searching using the label, redirecting to other page
                    // bubbleClickFunc={this.bubbleClick}
                    // legendClickFun={this.legendClick}
                    data = {data1}
            />,
        </div>)
    }
}



export class SearchTable extends Component {
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


 
