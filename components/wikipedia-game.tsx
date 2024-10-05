'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Timer } from './Timer'
import { ArrowRight } from 'lucide-react'

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
  const [leftTitle, setLeftTitle] = useState('')
  const [rightTitle, setRightTitle] = useState('')
  const [isGameOver, setIsGameOver] = useState(false)
  const [winner, setWinner] = useState<string | null>(null)
  const [resetTrigger, setResetTrigger] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(true)
  const [leftClickHistory, setLeftClickHistory] = useState<string[]>([])
  const [rightClickHistory, setRightClickHistory] = useState<string[]>([])
  const [randomPageTitle1, setRandomPageTitle1] = useState('')
  const [randomPageTitle2, setRandomPageTitle2] = useState('')

  const fetchRandomWikipediaPages = async () => {
    const url = 'https://en.wikipedia.org/w/api.php?action=query&list=random&format=json&rnnamespace=0&rnlimit=2&origin=*'
    try {
      const response = await fetch(url)
      const data = await response.json()
      const [randomTitle1, randomTitle2] = data.query.random.map(page => page.title)
      setRandomPageTitle1(randomTitle1)
      setRandomPageTitle2(randomTitle2)
      setLeftTitle(randomTitle1)
      setRightTitle(randomTitle1)
    } catch (error) {
      console.error('Error fetching random Wikipedia pages:', error)
    }
  }

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
    //   fetchRandomWikipediaPages()
    // }, [])

    //Start of temp code
    const fetchRandomPages = async () => {
      try {
        // Temporarily set fixed titles instead of fetching random ones
        const title1 = 'Jesus';
        const title2 = 'God_in_Christianity';

        setRandomPageTitle1(title1);
        setRandomPageTitle2(title2);

        // Set initial pages for both players
        setLeftTitle(title1);
        setRightTitle(title1);

        // Fetch content for both pages
        const content1 = await fetchWikipediaContent(title1);
        const content2 = await fetchWikipediaContent(title2);

        setLeftContent(content1);
        setRightContent(content1);
      } catch (error) {
        console.error('Error fetching random pages:', error);
      }
    };

    fetchRandomPages();
  }, []);
  //End of Temp Code

  useEffect(() => {
    if (leftTitle) fetchWikipediaContent(leftTitle, setLeftContent)
    if (rightTitle) fetchWikipediaContent(rightTitle, setRightContent)
  }, [leftTitle, rightTitle])

  const handleLeftLinkClick = (newTitle) => {
    setLeftTitle(newTitle)
    setLeftClickHistory(prev => [...prev, newTitle])
    checkWinner('Pixtral 12B', newTitle)
  }

  const handleRightLinkClick = (newTitle) => {
    setRightTitle(newTitle)
    setRightClickHistory(prev => [...prev, newTitle])
    checkWinner('Human', newTitle)
  }

  const checkWinner = (player: string, title: string) => {
    if (title.toLowerCase() === 'philosophy' || title === randomPageTitle2) {
      setWinner(player)
      setIsGameOver(true)
    }
  }

  const handleReset = () => {
    fetchRandomWikipediaPages()
    setIsGameOver(false)
    setWinner(null)
    setLeftContent('')
    setRightContent('')
    setIsTimerRunning(false)
    setLeftClickHistory([])
    setRightClickHistory([])
    setTimeout(() => setIsTimerRunning(true), 0)
  }

  const handleTimeUp = () => {
    setIsGameOver(true)
    setIsTimerRunning(false)
    if (!winner) {
      setWinner('No one')
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-none bg-primary p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary-foreground">Wikipedia Game</h1>
        <div className="flex items-center space-x-2">
          <span className="text-xl">🚦</span>
          <a
            href={`https://en.wikipedia.org/wiki/${encodeURIComponent(randomPageTitle1)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl font-semibold text-primary-foreground hover:underline"
          >
            {randomPageTitle1}
          </a>
          <ArrowRight className="text-primary-foreground" size={24} />
          <span className="text-xl">🏁</span>
          <a
            href={`https://en.wikipedia.org/wiki/${encodeURIComponent(randomPageTitle2)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl font-semibold text-primary-foreground hover:underline"
          >
            {randomPageTitle2}
          </a>
        </div>
        <div className="flex items-center">
          <Timer
            initialTime={180}
            onTimeUp={handleTimeUp}
            isRunning={isTimerRunning}
          />
          <Button onClick={handleReset} className="ml-4">Reset Game</Button>
        </div>
      </div>
      <div className="flex-grow flex overflow-hidden">
        <div className="w-1/2 flex flex-col">
          <div className="bg-blue-500 p-4 text-white font-bold text-xl sticky top-0 z-10">
            Pixtral 12B
          </div>
          <div className="overflow-auto flex-grow">
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-4">{leftTitle}</h2>
              <WikiContent html={leftContent} onLinkClick={handleLeftLinkClick} />
            </div>
          </div>
          <div className="bg-gray-300 p-4 text-gray-700 font-semibold text-sm sticky bottom-0 z-10 overflow-y-auto h-20 flex-shrink-0">
            <p className="mb-2 text-base">Click History:</p>
            <div className="space-y-2 overflow-y-auto max-h-36">
              {leftClickHistory.map((title, index) => (
                <input
                  key={index}
                  type="text"
                  value={title}
                  readOnly
                  className="w-full bg-gray-200 p-2 rounded text-sm"
                />
              ))}
            </div>
          </div>
        </div>
        <div className="w-1/2 flex flex-col border-l border-gray-300"> {/* Added border-l and border-gray-300 classes here */}
          <div className="bg-red-500 p-4 text-white font-bold text-xl sticky top-0 z-10">
            Human
          </div>
          <div className="overflow-auto flex-grow">
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-4">{rightTitle}</h2>
              <WikiContent html={rightContent} onLinkClick={handleRightLinkClick} />
            </div>
          </div>
          <div className="bg-gray-200 p-4 text-gray-700 font-semibold text-sm sticky bottom-0 z-10 overflow-y-auto h-20 flex-shrink-0">
            <p className="mb-2 text-base">Click History:</p>
            <div className="space-y-2 overflow-y-auto max-h-36">
              {rightClickHistory.map((title, index) => (
                <input
                  key={index}
                  type="text"
                  value={title}
                  readOnly
                  className="w-full bg-gray-100 p-2 rounded text-sm"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      {isGameOver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
            <p className="text-xl mb-4">
              {winner === 'No one'
                ? 'Time\'s up! No winner.'
                : `${winner} wins by reaching ${winner === 'Pixtral 12B' ? leftTitle : rightTitle
                }!`
              }
            </p>
            <Button onClick={handleReset}>Play Again</Button>
          </div>
        </div>
      )}
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