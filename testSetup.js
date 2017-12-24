import EnzymeAdapter from 'enzyme-adapter-react-16'
import enzyme from 'enzyme'
import 'jest-enzyme'

enzyme.configure({
  adapter: new EnzymeAdapter()
})
