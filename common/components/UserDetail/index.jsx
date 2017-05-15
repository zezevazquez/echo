/* eslint-disable react/jsx-handler-names */
import React, {Component, PropTypes} from 'react'
import moment from 'moment-timezone'
import {Tab, Tabs} from 'react-toolbox'

import ConfirmationDialog from 'src/common/components/ConfirmationDialog'
import WrappedButton from 'src/common/components/WrappedButton'
import ContentSidebar from 'src/common/components/ContentSidebar'
import ContentTable from 'src/common/components/ContentTable'
import UserProjectSummary from 'src/common/components/UserProjectSummary'
import {Flex} from 'src/common/components/Layout'
import {formatPartialPhoneNumber} from 'src/common/util/format'
import {STAT_DESCRIPTORS, MIN_EXTERNAL_REVIEW_COUNT_FOR_ACCURACY} from 'src/common/models/stat'
import {objectValuesAreAllNull, getStatRenderer, userCan, roundDecimal} from 'src/common/util'
import {mergeOverallStatsAndDeltas} from 'src/common/util/userProjectStatsCalculations'

import styles from './index.scss'
import theme from './theme.scss'

class UserDetail extends Component {
  constructor(props) {
    super(props)
    this.renderSidebar = this.renderSidebar.bind(this)
    this.renderTabs = this.renderTabs.bind(this)
    this.renderProjects = this.renderProjects.bind(this)
    this.renderCoachedProjects = this.renderCoachedProjects.bind(this)
    this.handleChangeTab = this.handleChangeTab.bind(this)
    this.showDeactivateUserDialog = this.showDeactivateUserDialog.bind(this)
    this.hideDeactivateUserDialog = this.hideDeactivateUserDialog.bind(this)
    this.handleDeactivateUser = this.handleDeactivateUser.bind(this)
    this.state = {tabIndex: 0, showingDeactivateUserDialog: false}
  }

  showDeactivateUserDialog() {
    this.setState({showingDeactivateUserDialog: true})
  }

  hideDeactivateUserDialog() {
    this.setState({showingDeactivateUserDialog: false})
  }

  handleChangeTab(tabIndex) {
    this.setState({tabIndex})
  }

  handleDeactivateUser() {
    const {onDeactivateUser} = this.props
    onDeactivateUser(this.props.user.id)
    this.setState({showingDeactivateUserDialog: false})
  }

  renderSidebarStatNames(stats) {
    return !objectValuesAreAllNull(stats) ? (
      <div>
        <div>Level</div>
        <div className={styles.betaStat}>Level.v2</div>
        <div>Elo</div>
        <div>XP</div>
        <div className={styles.betaStat}>XP.v2</div>
        <div className={styles.betaStat}>XP.v2 Pace</div>
        <div><nobr>Est. Accy.</nobr></div>
        <div><nobr>Est. Bias</nobr></div>
        <div>Challenge</div>
        <div><nobr>Ext. Reviews</nobr></div>
        <div><nobr>Review Accy.</nobr></div>
      </div>
    ) : <div/>
  }

  renderSidebarStatValues(stats) {
    const renderStat = getStatRenderer(stats)

    const extReviewCount = stats[STAT_DESCRIPTORS.EXTERNAL_PROJECT_REVIEW_COUNT]
    const reviewAccuracy = extReviewCount >= MIN_EXTERNAL_REVIEW_COUNT_FOR_ACCURACY ?
      renderStat(STAT_DESCRIPTORS.PROJECT_REVIEW_ACCURACY, '%') :
      '--'

    return !objectValuesAreAllNull(stats) ? (
      <div>
        <div>{renderStat(STAT_DESCRIPTORS.LEVEL)}</div>
        <div className={styles.betaStat}>{renderStat(STAT_DESCRIPTORS.LEVEL_V2)}</div>
        <div>{renderStat(STAT_DESCRIPTORS.ELO)}</div>
        <div>{renderStat(STAT_DESCRIPTORS.EXPERIENCE_POINTS)}</div>
        <div className={styles.betaStat}>{renderStat(STAT_DESCRIPTORS.EXPERIENCE_POINTS_V2)}</div>
        <div className={styles.betaStat}>{renderStat(STAT_DESCRIPTORS.EXPERIENCE_POINTS_V2_PACE)}</div>
        <div>{renderStat(STAT_DESCRIPTORS.ESTIMATION_ACCURACY, '%')}</div>
        <div>{renderStat(STAT_DESCRIPTORS.ESTIMATION_BIAS, '%')}</div>
        <div>{renderStat(STAT_DESCRIPTORS.CHALLENGE)}</div>
        <div>{renderStat(STAT_DESCRIPTORS.EXTERNAL_PROJECT_REVIEW_COUNT)}</div>
        <div>{reviewAccuracy}</div>
      </div>
    ) : <div/>
  }

  renderSidebar() {
    const {user, currentUser, defaultAvatarURL} = this.props
    const stats = user.stats || {}

    const emailLink = user.email ? (
      <a href={`mailto:${user.email}`} target="_blank" rel="noopener noreferrer">
        {user.email}
      </a>
    ) : null

    const phoneLink = user.phone ? (
      <a href={`tel:${user.phone}`} target="_blank" rel="noopener noreferrer">
        {formatPartialPhoneNumber(user.phone)}
      </a>
    ) : null

    const canBeDeactivated = user.active && userCan(currentUser, 'deactivateUser')
    const deactivateUserDialog = canBeDeactivated ? (
      <ConfirmationDialog
        active={this.state.showingDeactivateUserDialog}
        confirmLabel="Yes, Deactivate"
        onClickCancel={this.hideDeactivateUserDialog}
        onClickConfirm={this.handleDeactivateUser}
        title=" "
        >
        <Flex justifyContent="center" alignItems="center">
          Are you sure you want to deactivate {user.name} ({user.handle})?
        </Flex>
      </ConfirmationDialog>
    ) : null

    const deactivateUserButton = canBeDeactivated ? (
      <WrappedButton
        label="Deactivate"
        disabled={false}
        onClick={this.showDeactivateUserDialog}
        accent
        raised
        />
      ) : <div/>

    return (
      <ContentSidebar
        imageUrl={user.avatarUrl || defaultAvatarURL}
        imageLinkUrl={user.profileUrl}
        title={user.name}
        titleTooltip={user.id}
        subtitle={`@${user.handle}`}
        >
        <div className={styles.sidebar}>
          <Flex className={styles.section} flexDirection="column">
            <Flex className={styles.list}>
              <Flex className={styles.listLeftCol} flexDirection="column">
                {this.renderSidebarStatNames(stats)}
                <div><span>&nbsp;</span></div>
                <div>Email</div>
                <div>Phone</div>
                <div><span>&nbsp;</span></div>
                <div>Chapter</div>
                <div>Joined</div>
                <div>Updated</div>
              </Flex>
              <Flex className={styles.listRightCol} flexDirection="column">
                {this.renderSidebarStatValues(stats)}
                <div><span>&nbsp;</span></div>
                <div>{emailLink || '--'}</div>
                <div>{phoneLink || '--'}</div>
                <div><span>&nbsp;</span></div>
                <div>{user.chapter ? user.chapter.name : '--'}</div>
                <div>{moment(user.createdAt).format('MMM DD, YYYY') || '--'}</div>
                <div>{moment(user.updatedAt).format('MMM DD, YYYY') || '--'}</div>
              </Flex>
            </Flex>
          </Flex>
          <Flex className={styles.controls}>
            {deactivateUserButton}
          </Flex>
        </div>
        {deactivateUserDialog}
      </ContentSidebar>
    )
  }

  renderProjects() {
    const {userProjectSummaries} = this.props
    const summariesWithCombinedStats = mergeOverallStatsAndDeltas(userProjectSummaries || [])
    const projectSummaries = summariesWithCombinedStats.map((summary, i) =>
      <UserProjectSummary key={i} {...summary}/>
    )
    return (
      <div>
        {projectSummaries.length > 0 ?
          projectSummaries :
          <div>No projects yet.</div>
        }
      </div>
    )
  }

  renderCoachedProjects() {
    const {coachedProjects, onSelectCoachedProjectRow} = this.props
    const projectData = coachedProjects.map(project => {
      const members = (project.players || []).map(player => player.handle).join(', ')
      return {
        name: project.name,
        cycleNumber: project.cycle.cycleNumber,
        goalTitle: project.goal.title,
        memberHandles: members,
        coachCompletenessScore: !project.coachCompletenessScore || isNaN(project.coachCompletenessScore) ? '--' : `${roundDecimal(project.coachCompletenessScore)}`,
      }
    })
    const coachProjectModel = {
      name: {type: String},
      cycleNumber: {title: 'Cycle', type: String},
      goalTitle: {title: 'Goal', type: String},
      memberHandles: {title: 'Members', type: String},
      coachCompletenessScore: {title: "Coach's Review", type: String},
    }

    const content = !projectData.length ?
      <div className={styles.noCoachedProjects}>This player has not yet coached any projects</div> :
      (<ContentTable
        model={coachProjectModel}
        source={projectData}
        onSelectRow={onSelectCoachedProjectRow}
        allowSelect
        />)

    return content
  }

  renderTabs() {
    return (
      <div className={styles.tabs}>
        <Tabs
          index={this.state.tabIndex}
          onChange={this.handleChangeTab}
          theme={theme}
          fixed
          >
          <Tab label="Project History">
            <div>{this.renderProjects()}</div>
          </Tab>
          <Tab label="Coaching">
            <div>{this.renderCoachedProjects()}</div>
          </Tab>
        </Tabs>
      </div>
    )
  }

  render() {
    if (!this.props.user) {
      return null
    }

    return (
      <Flex className={styles.userDetail}>
        <Flex>
          {this.renderSidebar()}
        </Flex>
        <Flex fill>
          {this.renderTabs()}
        </Flex>
      </Flex>
    )
  }
}

UserDetail.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string,
    handle: PropTypes.string,
    name: PropTypes.string,
    avatarUrl: PropTypes.string,
    chapter: PropTypes.shape({
      name: PropTypes.string,
    }),
    stats: PropTypes.shape({
      [STAT_DESCRIPTORS.ELO]: PropTypes.number,
      [STAT_DESCRIPTORS.EXPERIENCE_POINTS]: PropTypes.number,
      [STAT_DESCRIPTORS.EXPERIENCE_POINTS_V2]: PropTypes.number,
      [STAT_DESCRIPTORS.EXPERIENCE_POINTS_V2_PACE]: PropTypes.number,
      [STAT_DESCRIPTORS.ESTIMATION_ACCURACY]: PropTypes.number,
      [STAT_DESCRIPTORS.ESTIMATION_BIAS]: PropTypes.number,
      [STAT_DESCRIPTORS.CHALLENGE]: PropTypes.number,
      [STAT_DESCRIPTORS.EXTERNAL_PROJECT_REVIEW_COUNT]: PropTypes.number,
    }),
  }),
  currentUser: PropTypes.shape({
    id: PropTypes.string,
    roles: PropTypes.array,
  }),
  userProjectSummaries: PropTypes.array,
  coachedProjects: PropTypes.array,
  navigate: PropTypes.func.isRequired,
  onDeactivateUser: PropTypes.func.isRequired,
  onSelectCoachedProjectRow: PropTypes.func.isRequired,
  defaultAvatarURL: PropTypes.string,
}

export default UserDetail
