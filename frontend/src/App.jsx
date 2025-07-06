

import './App.css'
import Textinput from './components/Textinput'
import Searchbar from './components/Searchbar'
import SettingCard from './components/Settingcard'
import Sendbox from './components/Sendbox'
import Settinguser from './components/Settinguser'
import MessageTopBar from './components/Messagetopbar'
import Personcard from './components/Personcard'
import MessageSended from './components/Messagesended'
import MessageReceived from './components/Messagereceived'
function App() {

  return (
    <>

      <Textinput />
      <Searchbar />
      <SettingCard />
      <Sendbox />
      <Settinguser />
      <MessageTopBar />
      <Personcard />
      <MessageSended />
      <MessageReceived />
    </>


  )
}

export default App
