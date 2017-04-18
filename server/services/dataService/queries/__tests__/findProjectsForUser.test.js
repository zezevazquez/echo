/* eslint-env mocha */
/* global expect, testContext */
/* eslint-disable prefer-arrow-callback, no-unused-expressions, max-nested-callbacks */
import {withDBCleanup, useFixture} from 'src/test/helpers'
import factory from 'src/test/factories'

import findProjectsForUser from '../findProjectsForUser'

describe(testContext(__filename), function () {
  withDBCleanup()
  useFixture.setCurrentCycleAndUserForProject()

  beforeEach(async function () {
    this.chapter = await factory.create('chapter')
    this.userProject = await factory.create('project', {chapterId: this.chapter.id})
    await this.setCurrentCycleAndUserForProject(this.userProject)
    this.otherProject = await factory.create('project', {chapterId: this.chapter.id})
  })

  it('returns the projects for the given player', async function () {
    const projectIds = (await findProjectsForUser(this.currentUser.id)).map(p => p.id)
    return expect(projectIds).to.deep.equal([this.userProject.id])
  })

  it('does not return projects with which the player is not involved', async function () {
    const projectIds = (await findProjectsForUser(this.currentUser.id)).map(p => p.id)
    return expect(projectIds).to.not.contain(this.otherProject.id)
  })
})
