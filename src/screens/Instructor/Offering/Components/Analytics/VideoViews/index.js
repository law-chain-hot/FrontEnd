import React, { Component, useState } from 'react';
import {XYPlot, DiscreteColorLegend, VerticalBarSeriesCanvas, LineSeries, VerticalGridLines, HorizontalGridLines, XAxis, YAxis, VerticalBarSeries, HorizontalBarSeries, LabelSeries} from 'react-vis';
import './index.css';
import 'react-vis/dist/style.css';
import { api } from 'utils'
import { parseCourseLogsForMediaViewChart, parseCourseLogs } from './util/util'
import { Tab, Table, Button, Menu, Icon, Segment, Dimmer, Loader, Dropdown } from 'semantic-ui-react'
import _ from 'lodash'
import Papa from 'papaparse'
import { Chart } from 'react-charts'
import PieChart from 'react-minimal-pie-chart'   //https://www.npmjs.com/package/react-minimal-pie-chart
import indigo from '@material-ui/core/colors/indigo';
import Pagination from "react-js-pagination";
// require("bootstrap/less/bootstrap.less");

var fileDownload = require('js-file-download')

export default class ForAllCharts extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            offeringId: props.offeringId,
            mediaViews:[],
            mediaViewsTotal:[],
            mergeTotal: [],
            playlists: this.props,
            temp:[]
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
                // console.log("---------media views", mediaViews)
                this.setState({ mediaViews })
                mediaViews_ = mediaViews
            })
        await api.getCourseLogs('timeupdate', offeringId)
            .then(({data}) => {
                const mediaViewsTotal = parseCourseLogs(data, playlists, 'count')
                // console.log("---------media views total", mediaViewsTotal)
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
        const { mergeTotal, playlists} = this.state
        const panes = [
            { menuItem: 'Chart', render: () => <VideoViewsChart mergeTotal={mergeTotal}/> },
            // { menuItem: 'Chart', render: () => <VideoViewsChart/> },
            { menuItem: 'Table', render: () => <VideoViewsTable mergeTotal={mergeTotal} setMediaView={this.setMediaView}/> },
        ]
        return (
            <div className="downwards">
                { (mergeTotal.length === 0)?
                <div>
                    <Segment className = 'table_loader'>
                    <Dimmer active inverted >
                    <Loader inverted content='Loading' />
                    </Dimmer>
                    </Segment>
                </div>
            :
                <div className='temp'>
                <p>TOP VIEWED VIDEOS (hours)</p>
                <hr></hr>
                <Tab menu={{ secondary: true, pointing: true }} panes={panes} />
                <p>INDIVIDUAL VIDEOS</p>
                <hr></hr>
                {/* <Tab menu={{ secondary: true, pointing: true }} panes={panes2} /> */}
                <IndividualChart mergeTotal={mergeTotal} lists={playlists}/>
                </div>}
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

    // handleClick = (numberOfBubbles) => () => {
    //     const {search} = this.props
    //     this.setState({result: search.slice(0, numberOfBubbles)})
    // }  

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
                <Table sortable celled unstackable striped>
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

                    <Pagination
                        boundaryRange={0}
                        defaultActivePage={1}
                        ellipsisItem={null}
                        firstItem={null}
                        lastItem={null}
                        siblingRange={1}
                        totalPages={mergeTotal.length/10}
                    />
)
                </Table> }
            </div>
        </div>);

          
    }
}

function VideoViewsChart({mergeTotal}) {
    var mergeTotalSort = _.sortBy(mergeTotal, 'count').reverse().slice(0,20)
    // console.log("now the mergeTotalSort is", mergeTotalSort)

    const [Length, setLength] = useState(10);
    const [Type, setType] = useState('bar');

    const parsedDataMonth = []
    const parsedDataTotal = []
    mergeTotalSort.forEach( media => {
        const { mediaName, count, lastMonth } = media
        parsedDataMonth.push([mediaName, lastMonth/4/60] )
        parsedDataTotal.push([mediaName, (count/4 - lastMonth/4)/60])
        // parsedDataMonth.push([lastMonth/4, mediaName] )
        // parsedDataTotal.push([count/4 - lastMonth/4, mediaName, ])
    }) 
    // console.log("now the month is", parsedDataMonth)
    // console.log("now the total is", parsedDataTotal)

    const data = []
    data.push({
        label: 'last 30 days',
        data: parsedDataMonth.slice(0, Length),
    },
    {
        label: 'older',
        data: parsedDataTotal.slice(0, Length),
    })

    const series = React.useMemo(
        () => ({
        type: Type
        }),
        []
    )

    const axes = React.useMemo(
        () => [
            { primary: true, type: 'ordinal', position: 'bottom'},
            { type: 'linear', position: 'left', stacked: true  }
        ],
        []
    )
    // const getSeriesStyle = React.useCallback(
    //     () => ({
    //       transition: 'all .5s ease'
    //     }),
    //     []
    //   )
    //   const getDatumStyle = React.useCallback(
    //     () => ({
    //       transition: 'all .5s ease'
    //     }),
    //     []
    //   )

    return (
        <div className = 'dora-chart'>
            <div className = 'bar-chart' 
                style={{
                width: Length*15+400 + 'px',
                height: '300px'
                }}  >    

                {/* <button onClick = {()=> setType('line')}>line</button>
                <button onClick = {()=> setType('bar')}>bar</button> */}
                <Dropdown text='Choose Number of Videos Display' button='true'>
                    <Dropdown.Menu>
                    <Dropdown.Item icon='circle outline' text='5' onClick={()=> setLength(5)}/>
                    <Dropdown.Item icon='circle outline' text='10' onClick={() => setLength(10)}/>
                    <Dropdown.Item icon='circle outline' text='15' onClick={() => setLength(15)}/>
                    <Dropdown.Item icon='circle outline' text='20' onClick={() => setLength(20)}/>
                    </Dropdown.Menu>
                </Dropdown> 
                <Chart className = 'bar-chart' data={data} series={series} axes={axes} tooltip/>
            </div>
        </div>
    )
}

export class IndividualChart extends Component {
    constructor(props) {
        super(props)
        this.state = {
            Option: null,
            parsedDataInd:[],
            total:[]
        }
    }
    // const [Length, setLength] = useState(10);
    // console.log("passed in playlist is ",playlists)
    // const [Option, setOption] = useState(null);
    componentDidMount(){
        this.getParsedDataInd()
    }
    getParsedDataInd(){
        const parsedDataInd_ = []
        const total_ = []
        this.props.lists.playlists.forEach( playlist => {
            const {name, medias} = playlist
            total_.push({
                name: name,
                medias: medias
            })
            parsedDataInd_.push({
                key: name,
                value: name,
                text: name})
        }) 
        // console.log("the parseddataind is", total_)
        this.setState({
            parsedDataInd: parsedDataInd_,
            total: total_,
            // Option: parsedDataInd_[0].text
        })
    }

    // handleChange = (e, {value}) =>{
    //     this.setState({Option: value})
    //     console.log('this is:', value)
    //   }

    render(){
        const {parsedDataInd, total, Option} = this.state
        const {mergeTotal} = this.props
        return (
            <div className = 'individual-chart'>
                <div className = 'firstdropdown'>
                <Dropdown 
                    placeholder='Select playlist'
                    fluid
                    search
                    selection
                    options={parsedDataInd}
                    // onChange={this.handleChange}
                    onChange={(e, {value})=>this.setState({Option: value})}
                    />
                
            <IndividualChartVideo mergeTotal={mergeTotal} option={Option} total={total}/>
                {/* <Dropdown 
                        placeholder='Select playlist'
                        fluid
                        search
                        selection
                        // options={total[_.findIndex(total, {name:Option})]}
                        options={Option}
                        />        */}
                </div> 
            </div>
        )
    }
}
// export class IndividualChartVideo extends Component {
//     // ({mergeTotal, option, total})
//     constructor(props) {
//         super(props)
//         this.state = {
//             Suboption: null,
//             videos:[]
//         }
//     }
//     componentDidMount(){
//         this.getparsed()
//     }
//     getparsed(){
//         const {option, total, mergeTotal} = this.props 
//         const idx = _.findIndex(total, {name: option})
//         console.log('total is', total, idx)
//         const ids = []
//         const videos_ = []
//         if(idx != -1){
//             total[idx].medias.forEach(media => {
//                 ids.push({
//                     id: media.id,
//                 })
//             })
//             ids.reverse().forEach(ele =>{
//                 var idx_ = _.findIndex(mergeTotal, {id: ele.id})
//                 videos_.push({
//                     key: mergeTotal[idx_].mediaName,
//                     value: mergeTotal[idx_].mediaName,
//                     text: mergeTotal[idx_].mediaName
//                 })
//             })
//         }
//         this.setState({videos: videos_})
//     }

//     // console.log('option is', option)
//     // console.log('option is', videos)
//     handleChange_ = (event, {value_}) =>{
//         this.setState({Suboption: value_})
//         // console.log('this is:', value)
//       }
//     render(){
//         const {videos} = this.state
//         return( 
//             <Dropdown 
//             placeholder='Select videos'
//             fluid
//             search
//             selection
//             options={videos}
//             // onChange={(event, {value}) => {setSuboption(value) 
//             //                         console.log('jaj')}}
//             onChange={this.handleChange_}
//             />
//         )
//     }
// }
function IndividualChartVideo({mergeTotal, option, total}){
    const [Suboption, setSuboption] = useState(null)
    const idx = _.findIndex(total, {name: option})
    console.log('total is', total, idx)
    const ids = []
    const videos = []
    if(idx != -1){
        total[idx].medias.forEach(media => {
            ids.push({
                id: media.id,
            })
        })
        ids.reverse().forEach(ele =>{
            var idx_ = _.findIndex(mergeTotal, {id: ele.id})
            videos.push({
                key: mergeTotal[idx_].mediaName,
                value: mergeTotal[idx_].mediaName,
                text: mergeTotal[idx_].mediaName
            })
        })
    }

    // console.log('option is', option)
    // console.log('option is', videos)
    // const handleChange_ = (event, {value_}) =>{
    //     this.setSuboption(value_)
    //     console.log('this is suboption:', value_)
    //   }
    return( 
        <div className='seconddropdown'>
            <Dropdown 
            placeholder='Select videos'
            fluid
            // search
            multiple
            selection
            options={videos}
            // onChange={(event, {value}) => {setSuboption(value) 
            //                         console.log('jaj')}}
            // onChange={this.handleChange_}
            onChange={(e, {value})=>setSuboption( value )}
            />
            <Piechart Suboption={Suboption} mergeTotal={mergeTotal}/>
        </div>
    )
}
function Piechart({ Suboption, mergeTotal }){
    console.log("what is suboption and mer", Suboption, mergeTotal)
    const inputcount = []
    
    // const inputdays = []
    var color = 100
    if(Suboption != null){
        Suboption.forEach(sub =>{
            const idx = _.findIndex(mergeTotal, {mediaName: sub})
            if(idx != -1){
                inputcount.push({
                    title: sub,
                    value: mergeTotal[idx].count/4/60,
                    color: indigo[color],
                    key: sub
                })
            }
            color += 100
        })      
    }
    console.log("what is inputcount", inputcount)

    

return(
    <div className='thepiechart'>
        <div className='boxforpie'>
     
            <PieChart
            data= {inputcount}
            label={({key, data, dataIndex }) =>
                // key.slice(6, -3)+ " " + 
                Math.round(data[dataIndex].percentage) + '%'
            }
            radius={42}
            animate={true}
            animationDuration={500}
            animationEasing="ease-out"
            labelPosition={50}
            labelStyle={{
                fill: '#121212',
                fontFamily: 'sans-serif',
                fontSize: '5px'
            }}
            background='#121212'
            
            // rounded={true}
            style={{
                height: '300px',
                width: '300px',
                color: indigo[500],
              }}
            />
        </div>
    </div>
    )
}
// function VideoViewsChart({ mergeTotal }) {
//     const parsedData = []
//     mergeTotal.forEach( media => {
//         const { mediaName, count } = media
//         parsedData.push({
//             y: mediaName,
//             x: count/4
//         })
//     }) 
//     const parsedData_ = _.sortBy(parsedData, 'x').reverse().slice(0,20)
//     console.log("---------parsed data", parsedData_)
//     return (
//         <div className="dora-chart">
//                 {/* { (parsedData_.length === 0)?
//                     <div>
//                         <Segment className = 'table_loader'>
//                         <Dimmer active inverted >
//                         <Loader inverted content='Loading' />
//                         </Dimmer>
//                         </Segment>
//                     </div>
//                 : */}
//             <div className="bar-chart">
//                     <XYPlot height={600} width={600} yType="ordinal" margin={{left: 150, right: 60}} animation="true" > 
//                         <HorizontalGridLines />
//                         <XAxis title="video minutes" />
//                         <YAxis /> 
//                         <HorizontalBarSeries data={parsedData_.reverse()} />
//                     </XYPlot>
//             </div> }
//         </div>
//     );
// }



//export class VideoViewsChart extends Component {	
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
//};