'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Timer } from './Timer'
import { ArrowRight } from 'lucide-react'
import { suggestLink, getSimilarityScore } from '../mistral/model';
import { Mistral } from '@mistralai/mistralai';

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
  const [StartWikiPage, setStartWikiPage] = useState('')
  const [TargetWikiPage, setTargetWikiPage] = useState('')
  const [aiThinking, setAiThinking] = useState(false)
  const [aiPath, setAiPath] = useState<string[]>([])
  const [leftSimilarityScore, setLeftSimilarityScore] = useState(0);
  const [rightSimilarityScore, setRightSimilarityScore] = useState(0);


  console.log('StartWikiPage', StartWikiPage)
  console.log('TargetWikiPage', TargetWikiPage)

  const logMove = async (player: string, newTitle: string) => {
    console.log(`YOOO ${player} has made a new move to: ${newTitle}`);

    try {
      const similarityScore = await getSimilarityScore(newTitle, TargetWikiPage);
      console.log(`Similarity score: ${similarityScore}`);

      if (player === 'Pixtral') {
        setLeftSimilarityScore(similarityScore);
      } else if (player === 'Human') {
        setRightSimilarityScore(similarityScore);
      }
    } catch (error) {
      console.error('Error getting similarity score:', error.message);
      console.log(`Move logged without similarity score for ${player} to ${newTitle}`);
    }
  };

  const fetchRandomWikipediaPages = async () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dateString = yesterday.toISOString().split('T')[0].replace(/-/g, '/');

    const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia/all-access/${dateString}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      const popularPages = data.items[0].articles
        .filter(article => !article.article.startsWith('Special:') && !article.article.startsWith('File:'))
        .map(article => article.article);

      const randomIndex1 = Math.floor(Math.random() * Math.min(50, popularPages.length));
      let randomIndex2 = Math.floor(Math.random() * Math.min(50, popularPages.length));
      while (randomIndex2 === randomIndex1) {
        randomIndex2 = Math.floor(Math.random() * Math.min(50, popularPages.length));
      }

      const randomTitle1 = popularPages[randomIndex1];
      const randomTitle2 = popularPages[randomIndex2];

      setStartWikiPage(randomTitle1);
      setTargetWikiPage(randomTitle2);
      setLeftTitle(randomTitle1);
      setRightTitle(randomTitle1);
    } catch (error) {
      console.error('Error fetching popular Wikipedia pages:', error);
    }
  }

  // const getLinks = async (title) => {
  //   var url = "https://en.wikipedia.org/w/api.php"; 
  //   var params = {
  //       action: "query",
  //       format: "json",
  //       titles: title,
  //       prop: "links"
  //   };
  //   url = url + "?origin=*";
  //   Object.keys(params).forEach(function(key){url += "&" + key + "=" + params[key];});
  //   console.log(url)
  //   fetch(url)
  //       .then(function(response){return response.json();})
  //       .then(function(response) {
  //           var pages = response.query.pages;
  //           for (var p in pages) {
  //               for (var l of pages[p].links) {
  //                   console.log(l)
  //                   console.log(l.title);
  //               }
  //           }
  //       })
  //       .catch(function(error){console.log(error);});
  // };

  const getLinks = async (title) => {
    const url = "https://en.wikipedia.org/w/api.php"
    const params = {
      action: "query",
      format: "json",
      titles: title,
      prop: "links",
      pllimit: "max"
    }

    const queryString = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&')

    const fullUrl = `${url}?origin=*&${queryString}`

    try {
      const response = await fetch(fullUrl)
      const data = await response.json()
      const pages = data.query.pages
      const links = []

      for (const pageId in pages) {
        if (pages[pageId].links) {
          links.push(...pages[pageId].links.map(link => link.title))
        }
      }
      return links
    } catch (error) {
      console.error('Error fetching links:', error)
      return []
    }
  }

  const fetchWikipediaContentLeft = async (title, setContent) => {
    const url = `https://en.wikipedia.org/w/api.php?action=parse&format=json&page=${title}&prop=text&origin=*`
    try {
      const response = await fetch(url)
      const data = await response.json()
      setContent(data.parse.text['*'])
      // console.log(getLinks(title))
    } catch (error) {
      console.error('Error fetching Wikipedia content:', error)
    }
  }

  const fetchWikipediaContentRight = async (title, setContent) => {
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
    fetchRandomWikipediaPages()
  }, [])

  //   //Start of temp code
  //   const fetchRandomPages = async () => {
  //     try {
  //       // Temporarily set fixed titles instead of fetching random ones
  //       const title1 = 'Single-molecule experiment';
  //       const title2 = 'Fluorescence';

  //       setStartWikiPage(title1);
  //       setTargetWikiPage(title2);

  //       // Set initial pages for both players
  //       setLeftTitle(title1);
  //       setRightTitle(title1);

  //       // Fetch content for both pages
  //       const content1 = await fetchWikipediaContent(title1);
  //       const content2 = await fetchWikipediaContent(title2);

  //       setLeftContent(content1);
  //       setRightContent(content1);
  //     } catch (error) {
  //       console.error('Error fetching random pages:', error);
  //     }
  //   };

  //   fetchRandomPages();
  // }, []);
  // //End of Temp Code

  useEffect(() => {
    if (leftTitle) fetchWikipediaContentLeft(leftTitle, setLeftContent)
    if (rightTitle) fetchWikipediaContentRight(rightTitle, setRightContent)
  }, [leftTitle, rightTitle])


  // const handleLeftLinkClick = (newTitle) => {
  //   setLeftTitle(newTitle)
  //   setLeftClickHistory(prev => [...prev, newTitle])
  //   checkWinner('Pixtral 12B', newTitle)
  // }

  const makeAIMove = useCallback(async () => {
    if (isGameOver || !isTimerRunning) return;

    setAiThinking(true);
    try {
      const links = await getLinks(leftTitle);
      const suggestion = await suggestLink({
        current_link: leftTitle,
        target: TargetWikiPage,
        links: links,
        visited_links: leftClickHistory
      });

      if (suggestion && suggestion.link) {
        await logMove('Pixtral', suggestion.link); // Add 'await' here
        console.log(`Relevance: ${suggestion.relevance}`);
        setAiPath(prev => [...prev, { link: suggestion.link, relevance: suggestion.relevance }]);
        setLeftTitle(suggestion.link);
        setLeftClickHistory(prev => [...prev, suggestion.link]);
        checkWinner('Pixtral 12B', suggestion.link);
      } else {
        console.error('Invalid suggestion from AI:', suggestion);
        // Handle the case where the AI doesn't provide a valid suggestion
        // You might want to skip the AI's turn or use a fallback strategy
      }
    } catch (error) {
      console.error('Error in AI move:', error);
      // Handle the error - maybe skip the AI's turn or use a fallback strategy
    } finally {
      setAiThinking(false);
    }
  }, [leftTitle, TargetWikiPage, isGameOver, isTimerRunning, getLinks, leftClickHistory]);

  // useEffect(() => {
  //   if (!aiThinking && !isGameOver && isTimerRunning) {
  //     const timer = setTimeout(() => {
  //       makeAIMove()
  //     }, 1000) // Add a 1-second delay between moves
  //     return () => clearTimeout(timer)
  //   }
  // }, [aiThinking, isGameOver, isTimerRunning, makeAIMove])

  useEffect(() => {
    if (!aiThinking && !isGameOver && isTimerRunning) {
      const timer = setTimeout(() => {
        // Only make a move if we're not on the start page or if it's the first move
        if (leftTitle !== StartWikiPage || leftClickHistory.length === 0) {
          makeAIMove();
        }
      }, 1000); // Add a 1-second delay between moves
      return () => clearTimeout(timer);
    }
  }, [aiThinking, isGameOver, isTimerRunning, makeAIMove, leftTitle, StartWikiPage, leftClickHistory]);

  const handleRightLinkClick = async (newTitle) => { // Make this function async
    await logMove('Human', newTitle); // Add 'await' here
    setRightTitle(newTitle);
    setRightClickHistory(prev => [...prev, newTitle]);
    checkWinner('Human', newTitle);
  };

  const checkWinner = (player: string, title: string) => {
    if (!isGameOver && (title.toLowerCase() === 'philosophy' || title === TargetWikiPage)) {
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
    setLeftSimilarityScore(0);
    setRightSimilarityScore(0);
    setAiThinking(false);
    setIsTimerRunning(false);

    // Use setTimeout to ensure state updates have propagated before restarting the timer
    setTimeout(() => {
      setIsTimerRunning(true);
    }, 100);
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
      <div className="flex-none bg-[#F9F9F9] p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-black">AI WikiGame</h1>
        <div className="flex items-center space-x-2">
          <span className="text-xl">🚦</span>
          <a
            href={`https://en.wikipedia.org/wiki/${encodeURIComponent(StartWikiPage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl font-semibold text-black hover:underline"
          >
            {StartWikiPage}
          </a>
          <ArrowRight className="text-black" size={24} />
          <span className="text-xl">🏁</span>
          <a
            href={`https://en.wikipedia.org/wiki/${encodeURIComponent(TargetWikiPage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl font-semibold text-black hover:underline"
          >
            {TargetWikiPage}
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
          <div className="bg-[#FFDEAD] p-4 text-black font-bold text-xl sticky top-0 z-10">
            <div className="flex justify-center items-center mb-2">
              🤖 Pixtral 12B
            </div>
            <div className="flex flex-col items-center text-sm">
              <div className="flex items-center w-full">
                <span className="mr-2">🥶</span>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${leftSimilarityScore}%` }}
                  ></div>
                </div>
                <span className="ml-2">🥵</span>
              </div>
              <div className="mt-1">Similarity: {leftSimilarityScore}%</div>
            </div>
          </div>
          <div className="overflow-auto flex-grow">
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-4">{leftTitle}</h2>
              <WikiContent html={leftContent} onLinkClick={() => { }} /> {/* Disable click handler */}
            </div>
          </div>
          <div className="bg-[#fcedd9] p-4 text-black font-semibold text-sm sticky bottom-0 z-10 overflow-y-auto h-40 flex-shrink-0">
            <p className="mb-2 text-base">📓📓 Click History:</p>
            <div className="space-y-2 overflow-y-auto max-h-36">
              {leftClickHistory.map((title, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={title}
                    readOnly
                    className="w-40 bg-gray-200 p-2 rounded text-sm"
                  />
                  {aiPath[index] && (
                    <span className="text-xs text-gray-500">{aiPath[index].relevance}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-1/2 flex flex-col border-l border-gray-300">
          <div className="bg-[#CCCCFF] p-4 text-black font-bold text-xl sticky top-0 z-10">
            <div className="flex justify-center items-center mb-2">
              🧠 Human
            </div>
            <div className="flex flex-col items-center text-sm">
              <div className="flex items-center w-full">
                <span className="mr-2">🥶</span>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${rightSimilarityScore}%` }}
                  ></div>
                </div>
                <span className="ml-2">🥵</span>
              </div>
              <div className="mt-1">Similarity: {rightSimilarityScore}%</div>
            </div>
          </div>
          <div className="overflow-auto flex-grow">
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-4">{rightTitle}</h2>
              <WikiContent html={rightContent} onLinkClick={handleRightLinkClick} />
            </div>
          </div>
          <div className="bg-[#E6E6F8] p-4 text-black font-semibold text-sm sticky bottom-0 z-10 overflow-y-auto h-40 flex-shrink-0">
            <p className="mb-2 text-base">📓 Click History:</p>
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