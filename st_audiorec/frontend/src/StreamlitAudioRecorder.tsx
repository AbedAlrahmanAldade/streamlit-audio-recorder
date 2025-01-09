import {
  Streamlit,
  StreamlitComponentBase,
  withStreamlitConnection,
} from "streamlit-component-lib"
import React, { ReactNode } from "react"

import AudioReactRecorder, { RecordState } from 'audio-react-recorder'
import 'audio-react-recorder/dist/index.css'

interface State {
  isFocused: boolean
  recordState: RecordState | null
  audioDataURL: string
  reset: boolean
}

class StAudioRec extends StreamlitComponentBase<State> {
  public state: State = { 
    isFocused: false, 
    recordState: RecordState.STOP, 
    audioDataURL: '', 
    reset: false
  }

  public render = (): ReactNode => {
    const { theme } = this.props
    const style: React.CSSProperties = {}

    if (theme) {
      const borderStyling = `1px solid ${ this.state.isFocused ? theme.primaryColor : "gray"}`
      style.border = borderStyling
      style.outline = borderStyling
    }

    return (
      <div>
        <button id='record' onClick={this.onClick_toggle}>
          {this.state.recordState === RecordState.START ? "Stop" : "🎙️ Record"}
        </button>

        <AudioReactRecorder
          state={this.state.recordState}
          onStop={this.onStop_audio}
          type='audio/wav'
          backgroundColor='rgb(255, 255, 255)'
          foregroundColor='rgb(255,76,75)'
          canvasWidth={450}
          canvasHeight={100}
        />
      </div>
    )
  }

  private onClick_toggle = () => {
    // Toggle between START and STOP states
    if(this.state.recordState === RecordState.START) {
      this.setState({ reset: false, recordState: RecordState.STOP })
    } else {
      this.setState({ reset: false, audioDataURL: '', recordState: RecordState.START })
      Streamlit.setComponentValue('')
    }
  }

  private onStop_audio = (data: { url: string }) => {
    if (this.state.reset === true) {
      this.setState({ audioDataURL: '' })
      Streamlit.setComponentValue('')
    } else {
      this.setState({ audioDataURL: data.url })

      fetch(data.url)
        .then(ctx => ctx.blob())
        .then(blob => (new Response(blob)).arrayBuffer())
        .then(buffer => {
          Streamlit.setComponentValue({ "arr": new Uint8Array(buffer) })
        })
    }
  }
}

export default withStreamlitConnection(StAudioRec)

Streamlit.setComponentReady()
Streamlit.setFrameHeight()
