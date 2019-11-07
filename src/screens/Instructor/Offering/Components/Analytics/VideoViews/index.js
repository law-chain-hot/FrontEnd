import React, { Component } from 'react';
import {XYPlot, DiscreteColorLegend, VerticalBarSeriesCanvas, LineSeries, VerticalGridLines, HorizontalGridLines, XAxis, YAxis, VerticalBarSeries, HorizontalBarSeries, LabelSeries} from 'react-vis';
import './index.css';
import PropTypes from 'prop-types';
import 'react-vis/dist/style.css';
import { api } from 'utils'
import { parseCourseLogsForMediaViewChart, parseCourseLogs } from './util'
import { Tab, Table, Button, Menu, Icon, Pagination, Segment, Dimmer, Loader } from 'semantic-ui-react'
import _ from 'lodash'
import Papa from 'papaparse'

import CanvasJSReact from './canvasjs.react';
import { parse } from 'es-cookie';
var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;
var fileDownload = require('js-file-download')


export default class ForAllCharts extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            offeringId: props.offeringId,
            mediaViews:[],
            mediaViewsTotal:[],
            mergeTotal: []
        }
    }
    
    componentDidMount() {
        this.getAllData()
    }

    setMediaView = mediaViewsTotal => this.setState({ mediaViewsTotal })
    getAllData = async () => {
        const { offeringId, playlists } = this.props
        var mediaViewsTotal_ = null
        var mediaViews_ = null
        var mergeTotal_ = null
        await api.getCourseLogs('timeupdate', offeringId, "2019-09-03T11:11:11.111Z", new Date().toISOString())
            .then(({data}) => {
                const mediaViews = parseCourseLogsForMediaViewChart(data, playlists).reverse()
                console.log("---------media views", mediaViews)
                this.setState({ mediaViews })
                mediaViews_ = mediaViews
            })
        await api.getCourseLogs('timeupdate', offeringId)
            .then(({data}) => {
                const mediaViewsTotal = parseCourseLogs(data, playlists, 'count')
                console.log("---------media views total", mediaViewsTotal)
                this.setState({ mediaViewsTotal })
                mediaViewsTotal_ = mediaViewsTotal
            })
        mergeTotal_ = _.values(_.merge(_.keyBy(mediaViewsTotal_, 'id'), _.keyBy(mediaViews_, 'id')))
        this.setState({
            mergeTotal: mergeTotal_
        })
        console.log("---------merge total", mergeTotal_)
    }

    render() {
        const { mergeTotal } = this.state
        const panes = [
            { menuItem: 'Chart', render: () => <VideoViewsChart mergeTotal={mergeTotal}/> },
            // { menuItem: 'Chart', render: () => <VideoViewsChart/> },
            { menuItem: 'Table', render: () => <VideoViewsTable mergeTotal={mergeTotal} setMediaView={this.setMediaView}/> },
        ]
        return (
            <div className="downwards">
                <p>TOP VIEWED VIDEOS</p>
                <hr></hr>
                <Tab menu={{ secondary: true, pointing: true }} panes={panes} />
            </div>
        );
    }
}
    




// export class VideoViewsChart extends Component {	
// 	constructor() {
// 		super();
// 		this.toggleDataSeries = this.toggleDataSeries.bind(this);
// 	}
// 	toggleDataSeries(e) {
// 		if(typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
// 			e.dataSeries.visible = false;
// 		}
// 		else {
// 			e.dataSeries.visible = true;
// 		}
// 		this.chart.render();
// 	}

//     render() {
//         const {mergeTotal} = this.props
//         var mergeTotalSort = _.sortBy(mergeTotal, 'count').reverse().slice(0,10)
//         console.log("now the mergeTotalSort is", mergeTotalSort)
//         const parsedDataMonth = []
//         const parsedDataTotal = []
//         mergeTotalSort.forEach( media => {
//             const { mediaName, count, lastMonth } = media
//             parsedDataMonth.push({
//                 label: mediaName,
//                 y: lastMonth/4
//             })
//             parsedDataTotal.push({
//                 label: mediaName,
//                 y: count/4 - lastMonth/4
//             })
//         }) 
//         console.log("now the parsed data is", parsedDataMonth)
//         console.log("now the parsed data is", parsedDataTotal)

//             const options = {
//                 animationEnabled: true,
//                 theme: "light2",
//                 // height: 600,
//                 dataPointMinWidth: 20,
//                 dataPointWidth: 25,
//                 toolTip: {
//                     shared: true
//                 },
//                 legend: {
//                     verticalAlign: "top"
//                 },
//                 axisY: {
//                     title: "views",
//                     // LabelFontSize:5,
//                     // suffix: "views"
//                 },
//                 axisX: {
//                     title: "Videos",
//                     // LabelFontSize: 5,
//                 },
//                 data: [{
//                     type: "stackedBar",
//                     color: "#9bbb59",
//                     name: "Views From Last 30 days",
//                     showInLegend: true,
//                     indexLabel: "{y}",
//                     indexLabelFontColor: "white",
//                     yValueFormatString: "#,###",
//                     dataPoints: parsedDataMonth
//                 },
//                 {
//                     type: "stackedBar",
//                     // color: "#7f7f7f",
//                     color: "#5f7b56",
//                     name: "Older",
//                     showInLegend: true,
//                     indexLabel: "{y}" == "0"? "0": "{y}",
//                     indexLabelFontColor: "white",
//                     yValueFormatString: "#,###",
//                     dataPoints: parsedDataTotal
//                 }
//             ]
//             }
//         return (
//         <div>
//             <div className="dora-chart"> 
//             { (parsedDataTotal.length === 0)?
//                 <div bar-chart>
//                     <Segment className = 'table_loader'>
//                     <Dimmer active inverted >
//                     <Loader inverted content='Loading' />
//                     </Dimmer>
//                     </Segment>
//                 </div>
//             : 
//             <div>
//             {/* <div className="bar-chart"> */}
//             <CanvasJSChart options = {options}
//                     // onRef={ref => this.chart = ref}
//             />
//            </div>}
//         </div>
//         </div>
//         );
//     }
// };


export class VideoViewsTable extends Component {
    constructor(props) {
        super(props)
        this.state = {
            column: null,
            direction: null,
            page: 1,
        }
    }

    handleSort = (clickedColumn) => () => {
        const { column, direction } = this.state
        const { mergeTotal, setMediaView } = this.props
        if (column !== clickedColumn) {
            this.setState({
                column: clickedColumn,
                direction: 'ascending',
            })
            setMediaView(_.sortBy(mergeTotal, [clickedColumn]))
        } else {
            this.setState({
                direction: direction === 'ascending' ? 'descending' : 'ascending',
            })
            setMediaView(mergeTotal.reverse())
        }
    }  


    onDownload = () => {
        const { mergeTotal } = this.props
        const csvStr = Papa.unparse(mergeTotal)
        fileDownload(csvStr, 'video-length.csv')
    }

    render() {
        const { column, direction, page } = this.state
        //const totalPages = this.items.length / itemsPerPage;
        const { mergeTotal } = this.props
        return (
        <div className = 'allouter'>
            <div className = 'VideoViewTable1'>
                <Button content="Download" onClick={this.onDownload} primary>
                </Button>

                { (mergeTotal.length === 0)?
                    <div>
                        <Segment className = 'table_loader'>
                        <Dimmer active inverted >
                        <Loader inverted content='Loading' />
                        </Dimmer>
                        </Segment>
                    </div>
                :
                <Table sortable celled unstackable>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell collapsing>
                                Index
                            </Table.HeaderCell>
            
                            <Table.HeaderCell
                                sorted={column === 'mediaName' ? direction : null}
                                onClick={this.handleSort('mediaName')}
                            >
                                MediaName
                            </Table.HeaderCell>
                            <Table.HeaderCell
                                sorted={column === 'lastHr' ? direction : null}
                                onClick={this.handleSort('lastHr')}
                            >
                                last 1 Hour(mins)
                            </Table.HeaderCell>
                            <Table.HeaderCell
                                sorted={column === 'last3days' ? direction : null}
                                onClick={this.handleSort('last3days')}
                            >
                                last 3 days(mins)
                            </Table.HeaderCell>
                            <Table.HeaderCell
                                sorted={column === 'lastWeek' ? direction : null}
                                onClick={this.handleSort('lastWeek')}
                            >
                                last week(mins)
                            </Table.HeaderCell>
                            <Table.HeaderCell
                                sorted={column === 'lastMonth' ? direction : null}
                                onClick={this.handleSort('lastMonth')}
                            >
                                last month(mins)
                            </Table.HeaderCell>
                            <Table.HeaderCell
                                sorted={column === 'count' ? direction : null}
                                onClick={this.handleSort('count')}
                            >
                                total mins
                            </Table.HeaderCell>
                            <Table.HeaderCell
                                sorted={column === 'sum' ? direction : null}
                                onClick={this.handleSort('sum')}
                            >
                                number of unique students viewed
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                    {
                        mergeTotal.map(( media, index) => 
                            <Table.Row key={media.mediaName}>
                                <Table.Cell>{index + 1}</Table.Cell>
                                <Table.Cell>{media.mediaName}</Table.Cell>
                                <Table.Cell>{media.lastHr/4}</Table.Cell>
                                <Table.Cell>{media.last3days/4}</Table.Cell>
                                <Table.Cell>{media.lastWeek/4}</Table.Cell>
                                <Table.Cell>{media.lastMonth/4}</Table.Cell>
                                <Table.Cell>{media.count/4}</Table.Cell>
                                <Table.Cell>{media.sum}</Table.Cell>
                            </Table.Row>
                        )
                    }
                    </Table.Body>

                    <Table.Footer>
                        <Table.Row>
                            <Table.HeaderCell colSpan='4'>
                            <Menu floated='right' pagination>
                                <Menu.Item as='a' icon>
                                <Icon name='chevron left' />
                                </Menu.Item>
                                <Menu.Item
                                    name="1"
                                    active={page === 1}
                                    onClick={() => this.handlePageClick(1)}
                                    />
                                <Menu.Item 
                                    name="2"
                                    active={page === 2}
                                    onClick={() => this.handlePageClick(2)}
                                    />
                                <Menu.Item 
                                    name="3"
                                    active={page === 3}
                                    onClick={this.handlePageClick}
                                    />
                                <Menu.Item as='a' icon>
                                <Icon name='chevron right' />
                                </Menu.Item>
                            </Menu>
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Footer>  
                </Table> }
            </div>
        </div>);

          
    }
}




function VideoViewsChart({ mergeTotal }) {
    const parsedData = []
    mergeTotal.forEach( media => {
        const { mediaName, count } = media
        parsedData.push({
            y: mediaName,
            x: count/4
        })
    }) 
    const parsedData_ = _.sortBy(parsedData, 'x').reverse().slice(0,20)
    console.log("---------parsed data", parsedData_)
    return (
        <div className="dora-chart">
                {/* { (parsedData_.length === 0)?
                    <div>
                        <Segment className = 'table_loader'>
                        <Dimmer active inverted >
                        <Loader inverted content='Loading' />
                        </Dimmer>
                        </Segment>
                    </div>
                : */}
            <div className="bar-chart">
                    <XYPlot height={600} width={600} yType="ordinal" margin={{left: 150, right: 60}} animation="true" > 
                        <HorizontalGridLines />
                        <XAxis title="video minutes" />
                        <YAxis /> 
                        <HorizontalBarSeries data={parsedData_.reverse()} />
                    </XYPlot>
            </div> }
        </div>
    );
}





