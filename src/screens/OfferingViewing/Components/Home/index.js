/**
 * Home sub-screen for Offering Viewing screen
 */

import React, { Suspense, lazy } from 'react'
// UI
import Filter from  './Filter'
import { OfferingListHolder } from './PlaceHolder'
import { ClassTranscribeFooter } from '../../../../components'
import './index.css'
// Vars
import { api } from '../../../../util'
// Lazy loading
const OfferingList = lazy(() => import('./OfferingList'))

export class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      userId: '',

      universities: [],
      terms: [],
      departments: [],
      courses: [],
      offerings: props.offerings,

      uniSelected: [],
      departSelected: [],
      termSelected: [],

      restoredScroll: false,
    }
  }

  componentDidMount() {
    api.getAll(['Universities', 'Departments', 'Terms'], this.getAllCallBack)
  }
  
  componentDidUpdate(prevProps) {
    if (this.props.offerings !== prevProps.offerings) {
      this.setState({ offerings: this.props.offerings })
    }
    if (window.location.pathname && !this.state.restoredScroll) {
      const hash = window.location.hash
      if (hash) {
        const elem = document.getElementById(hash.slice(1, hash.length))
        if (elem) {
          elem.scrollIntoView({block: "nearest"})
          this.setState({restoredScroll: true})
        }
      }
    }
  }

  getDepartmentsByUniId = uniId => {
    api.getDepartsByUniId(uniId)
     .then(({data}) => {
        // data = handleData.shuffle(data)
        this.setState({ departments: data, departSelected: [] })
     })
  }

  getTermsByUniId = uniId => {
    api.getTermsByUniId(uniId)
      .then(({data}) => {
        this.setState({ terms: data, termSelected: [] })
      })
  }

  getAllCallBack = ({data}, stateName) => {
    if (stateName === 'offerings') {
      this.completeOfferings(data)
    } else if (stateName === 'departments'|| stateName === 'terms') {
      data.forEach( (obj, index) => {
        this.getUniversityById(obj.universityId, index, stateName)
      })
    }
    this.setState({[stateName]: data})
  }

  getUniversityById = (uniId, index, key) => {
    api.getUniversityById(uniId)
      .then( ({data}) => {
        const toSet = this.state[key]
        toSet[index].uniName = data.name
        this.setState({[key]: toSet})
      })
  }

  onUniSelected = (e, {value}) => {
    if (!value) {
      api.getAll(['Departments', 'Terms'], this.getAllCallBack)
    } else {
      this.getDepartmentsByUniId(value)
      this.getTermsByUniId(value)
    }
    this.setState({ uniSelected: value })
  }

  onDepartSelected = (e, {value}) => {
    this.setState({ departSelected: value })
  }

  onTermSelected = (e, {value}) => {
    this.setState({ termSelected: value })
  }

  render() {
    return (
      <main className="sp-home">
        <div id="home-content">
          <Filter {...this} />
          <Suspense fallback={<OfferingListHolder />}>  
            <OfferingList {...this} />
          </Suspense>
          <ClassTranscribeFooter />
        </div>
      </main>
    )
  }
}
