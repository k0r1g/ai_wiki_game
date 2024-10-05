'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"

// WikiContent component to render Wikipedia content with clickable blue links
const WikiContent = ({ html, onLinkClick }) => {
  const createMarkup = () => ({ __html: html })

  const handleClick = (e) => {
    if (e.target.tagName === 'A' && e.target.getAttribute('href')?.startsWith('/wiki/')) {
      e.preventDefault()
      const title = e.target.getAttribute('href').split('/wiki/')[1]
      onLinkClick(title)
    }
  }

  return (
    <div
      onClick={handleClick}
      dangerouslySetInnerHTML={createMarkup()}
      className="wiki-content"
    />
  )
}

export function WikipediaGameComponent() {
  const [leftContent, setLeftContent] = useState('')
  const [rightContent, setRightContent] = useState('')
  const [leftTitle, setLeftTitle] = useState('Jesus')
  const [rightTitle, setRightTitle] = useState('Jesus')

  const fetchWikipediaContent = async (title, setContent) => {
    const url = `https://en.wikipedia.org/w/api.php?action=parse&format=json&page=${title}&prop=text&origin=*`
    try {
      const response = await fetch(url)
      const data = await response.json()
      setContent(data.parse.text['*'])
    } catch (error) {
      console.error('Error fetching Wikipedia content:', error)
    }
  }

  useEffect(() => {
    fetchWikipediaContent(leftTitle, setLeftContent)
    fetchWikipediaContent(rightTitle, setRightContent)
  }, [leftTitle, rightTitle])

  const handleLeftLinkClick = (newTitle) => {
    setLeftTitle(newTitle)
  }

  const handleRightLinkClick = (newTitle) => {
    setRightTitle(newTitle)
  }

  const handleReset = () => {
    setLeftTitle('Jesus')
    setRightTitle('Jesus')
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-none bg-primary p-4">
        <h1 className="text-2xl font-bold text-primary-foreground">Wikipedia Game</h1>
        <Button onClick={handleReset} className="mt-2">Reset to Jesus Page</Button>
      </div>
      <div className="flex-grow flex overflow-hidden">
        <div className="w-1/2 overflow-auto p-4 border-r">
          <h2 className="text-xl font-semibold mb-4">{leftTitle}</h2>
          <WikiContent html={leftContent} onLinkClick={handleLeftLinkClick} />
        </div>
        <div className="w-1/2 overflow-auto p-4">
          <h2 className="text-xl font-semibold mb-4">{rightTitle}</h2>
          <WikiContent html={rightContent} onLinkClick={handleRightLinkClick} />
        </div>
      </div>
      <style jsx global>{`
        .wiki-content a {
          color: blue;
          text-decoration: underline;
        }
        .wiki-content a:hover {
          text-decoration: none;
        }
      `}</style>
    </div>
  )
}