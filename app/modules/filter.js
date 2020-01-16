import _ from 'lodash'
import moment from 'moment'

export default (profiles, user, swipedProfiles) => {
  console.log('profiles in filter', profiles[0].uid)
  const rejectMe = _.reject(profiles, profile => profile.uid === user.uid)

  const filterGender = _.filter(rejectMe, profile => {
    const userShowFFCouple = user.lookingFor['Female & Female Couple'] && profile.accountType === 'Female & Female Couple'
    const userShowMFCouple = user.lookingFor['Male & Female Couple'] && profile.accountType === 'Male & Female Couple'
    const userShowMMCouple = user.lookingFor['Male & Male Couple'] && profile.accountType === 'Male & Male Couple'
    const userShowSingleMale = user.lookingFor['Single Male'] && profile.accountType === 'Single Male'
    const userShowSingleFemale = user.lookingFor['Single Female'] && profile.accountType === 'Single Female'
    const userShowTrans = user.lookingFor['Trans'] && profile.accountType === 'Trans'

    const profileShowFFCouple = profile.lookingFor['Female & Female Couple'] && user.accountType === 'Female & Female Couple'
    const profileShowMFCouple = profile.lookingFor['Male & Female Couple'] && user.accountType === 'Male & Female Couple'
    const profileShowMMCouple = profile.lookingFor['Male & Male Couple'] && user.accountType === 'Male & Male Couple'
    const profileShowSingleMale = profile.lookingFor['Single Male'] && user.accountType === 'Single Male'
    const profileShowSingleFemale = profile.lookingFor['Single Female'] && user.accountType === 'Single Female'
    const profileShowTrans = profile.lookingFor['Trans'] && user.accountType === 'Trans'

    // const profileShowMen = profile.showMen && user.gender === 'Male'
    // const profileShowWomen = profile.showWomen && user.gender === 'Female'

    return (userShowFFCouple || userShowMFCouple || userShowMMCouple || userShowSingleMale || userShowSingleFemale || userShowTrans) && (profileShowFFCouple || profileShowMFCouple || profileShowMMCouple || profileShowSingleMale || profileShowSingleFemale || profileShowTrans)
  })

  const userBirthday = moment(user.birthday, 'MM/DD/YYYY')
  const userAge = moment().diff(userBirthday, 'years')

  const filterAgeRange = _.filter(filterGender, profile => {
    const profileBirthday = moment(profile.birthday, 'MM/DD/YYYY')
    const profileAge = moment().diff(profileBirthday, 'years')

    const withinRangeUser = _.inRange(profileAge, user.ageRange[0], user.ageRange[1] + 1)
    const withinRangeProfile = _.inRange(userAge, profile.ageRange[0], profile.ageRange[1] + 1)

    return withinRangeUser && withinRangeProfile
  })

  const filtered = _.uniqBy(filterAgeRange, 'uid')

  const filterSwiped = _.filter(filtered, profile => {
    const swiped = profile.uid in swipedProfiles
    return !swiped
  })

  return filterSwiped
}
