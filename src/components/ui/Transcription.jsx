import React from 'react'

export default function Transcription(props) {
    const { textElement } = props

    return (
        <div className="whitespace-pre-line text-left">{textElement}</div>
    )
}