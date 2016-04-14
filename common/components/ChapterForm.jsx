/* eslint-disable react/jsx-handler-names */
import React, {Component, PropTypes} from 'react'
import moment from 'moment-timezone'

import {Button} from 'react-toolbox/lib/button'
import {CardTitle} from 'react-toolbox/lib/card'
import Dropdown from 'react-toolbox/lib/dropdown'
import DatePicker from 'react-toolbox/lib/date_picker'
import TimePicker from 'react-toolbox/lib/time_picker'
import FontIcon from 'react-toolbox/lib/font_icon'
import Input from 'react-toolbox/lib/input'
import ProgressBar from 'react-toolbox/lib/progress_bar'

import NotFound from './NotFound'
import styles from './ChapterForm.scss'

// blatantly stolen from: https://gist.github.com/mathewbyrne/1280286
function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '')             // Trim - from end of text
}

class ChapterForm extends Component {
  constructor() {
    super()
    this.handleChangeName = this.handleChangeName.bind(this)
    this.generateTimezoneDropdownValues()
  }

  generateTimezoneDropdownValues() {
    // const now = new Date()
    this.timezones = moment.tz.names().map(zoneName => {
      // const zone = moment.tz.zone(zoneName)
      // const hoursOffset = zone.offset(now) / 60
      // const plusMinus = hoursOffset >= 0 ? '+' : '-'

      return {
        value: zoneName,
        label: zoneName,
        // TODO: ideally, we'd use the string below for the label, but this bug
        // (https://github.com/react-toolbox/react-toolbox/issues/297) prevents it
        //
        // label: `${zoneName} (UTC${plusMinus}${Math.abs(hoursOffset)})`
      }
    })
  }

  handleChangeName(val) {
    const {fields: {name, channelName}} = this.props
    const nameSlug = slugify(val)
    name.onChange(val)
    channelName.onChange(nameSlug)
  }

  render() {
    const {
      fields: {id, name, timezone, channelName, cycleDuration, cycleEpochDate, cycleEpochTime},
      handleSubmit,
      submitting,
      errors,
      buttonLabel,
      isBusy,
      formType,
    } = this.props

    if (isBusy) {
      return <ProgressBar/>
    }
    if (formType === 'notfound') {
      return <NotFound/>
    }

    return (
      <div>
        <CardTitle title={`${formType === 'new' ? 'Create' : 'Edit'} Chapter`}/>
        <form onSubmit={handleSubmit}>
          <Input
            type="hidden"
            {...id}
            />
          <Input
            icon="title"
            type="text"
            label="Name"
            {...name}
            onChange={this.handleChangeName}
            error={name.dirty ? name.error : null}
            />
          <Input
            icon="chat"
            type="text"
            disabled
            label="Chat Channel Name"
            {...channelName}
            />
          <Dropdown
            icon="flag"
            label="Timezone"
            source={this.timezones}
            {...timezone}
            error={timezone.dirty ? timezone.error : null}
            />
          <Input
            icon="av_timer"
            type="tel"
            label="Cycle Duration (e.g., '1 week', '3 hours', etc.)"
            {...cycleDuration}
            error={cycleDuration.dirty ? cycleDuration.error : null}
            />
          <div className={styles.cycleEpochDate}>
            <DatePicker
              label="Cycle Epoch Date"
              {...cycleEpochDate}
              error={cycleEpochDate.dirty ? cycleEpochDate.error : null}
              />
            <FontIcon value="today" className={styles.cycleEpochDateIcon}/>
          </div>
          <div className={styles.cycleEpochTime}>
            <TimePicker
              label="Cycle Epoch Time"
              format="ampm"
              {...cycleEpochTime}
              error={cycleEpochTime.dirty ? cycleEpochTime.error : null}
              />
            <FontIcon value="watch_later" className={styles.cycleEpochTimeIcon}/>
          </div>
          <Button
            label={buttonLabel || 'Save'}
            primary
            raised
            disabled={submitting || isBusy || Object.keys(errors).length > 0}
            type="submit"
            />
        </form>
      </div>
    )
  }
}

ChapterForm.propTypes = {
  errors: PropTypes.object.isRequired,
  fields: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  buttonLabel: PropTypes.string,
  auth: PropTypes.shape({
    isBusy: PropTypes.bool.isRequired,
    currentUser: PropTypes.object,
  }),
  isBusy: PropTypes.bool.isRequired,
  formType: PropTypes.oneOf(['new', 'update', 'notfound']).isRequired,
}

export default ChapterForm