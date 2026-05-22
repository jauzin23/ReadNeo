const core = require("@actions/core");
const fs = require("fs");
const { fetchStats } = require("./github");
const { renderSvg, themes } = require("./renderer");

const defaultAscii = `                                                        +:;xxxxXX                                    
                                               ++;;;;;;;;;;;;;;;+                                   
                                           x;;;;;;;;;;;;;;;;;;;;;;;;;+                              
                                         +;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;x                           
                                       x+;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;x                         
                            X;:::+    +;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;+                       
                     ;:::::::::;;;X  +;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;+                      
                    ;:::::::::;xXX  x+;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;+x                     
                   x::::::::::;x   x++;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;+   +;:;;             
                   x::::::;;:::+X  x++;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;+X  +;;:::+           
                    ;::;:::+x+++x::x+++++;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;+X  $x;:::::::+       
                   X::;+;:;;xxxxx;:xx++++++++++++++++;;;;;;++;;;;;;;;;;;;;;;++xX  x;::::::::::      
                    +;+xxxxxxxx++xxxx+++++++++++++++++++++++++++++++;;;;;;++++xx  x++;+:::::::;     
                     $Xxxxxxxxxx+xxxx++++++++++++++++++++++++++++++++++++++++xxX Xx+x;:::::::::x    
                        Xxxxxx+++xxx++++++;;;;;;;;;;;;;;;++++++++++++++++++++xXXXx++x++++;:::;x     
                         Xxx+++++xxx++++++++++++xxxxx++++++;+;;+++++++++++++xxxxxx+xxxxxx;::+X$     
                          Xxxx++xxxx++xxxxXXxxxx+++++++xxxxxx++++++++++++++xxxxxxx+xxxxxxx+x$       
                           Xxxxxxxxxxxxxxxxx++++++++++++++++++xxx++++++++++xxxxx++++xxxxxxX         
                            Xxxxxx$$$$$$$$XXx+++xxxxxxx+++++++++++xxx+++++++xxxx++++xxxxX           
                             Xxxx$$$$$$$$$XXx++++xxxxxXXXX$XXXxx+++++xxx++++xxxx+++xxxxX            
                              XxX$$$$$$$$$XXxxxxxxxxxxXXXX$$$$XXxx++++;+xxxxxxxx+xxxxX              
                               $$$$$$$$$$$$$XXXXXXxxXXXXXX$$$$$Xx+;;+x+;+XXxxxxxxxxX$               
                                $$$$$$$$$$$$$$$XxxxxXXX$$$$$$$$$Xxx+xXx+xxxxxxxxxX                  
                                 $$$$$$$$$$$$$Xxx++xX$$$$$$$$$$$$XXXXXX++xxxxxxX                    
                                  xx$$$$$$$$Xxx;;;;;+$$$$$$$$$$$$$$$$$x;+xxxxXX                     
                                  x;;+xXXXxx+;;;;;;;;+X$$$$$$$$$$$$$$x;;xxxxX                       
                                   x+;;+++;;;;;;;;;;;;+xX$$$$$$$$$$X+;;;xxXX$                       
                                     xx++++++++++++;;;;;++xxXXXXx+;;;;+xX$                          
                                       Xxxxx+++++++++++++++++++++++;+xX                             
                                       $xxxxXXXXxxxxxxxx++++++++++xxxX                              
                                      x+++++++xx::;;xXXXXXXXXXXXxxxX                                
                                     +;;;;;;++++++++xxxxxxxxxxxxxX$                                 
                                   +;;;;;;;;;;;;;;+++++++++++++xx                                   
                                  x;;;;;;;;;;;;;;;;;;;;++++++++X                                    
                                 X+;;;;;;;;;;;;;;;;;;;;;;;;+++x                                     
                                x;;;;;;;;;;;;;;;;;;;;;;;;;;;++x                                     
                               x+++xx+++;;;;;;;;;;;;;;;;;;;+++X                                     
                              Xx+;;;+xXXXXXxx+;;;;;;;;;;;;;+++X                                     
                              ;;;;;;;;+xXxxxXXXXXxx+;;;;;;;;+X                                      
                            +;;;;;;;;;+xxxxxxxxxxXXXXXx+;;;;x                                       
                           ;;;;;;;;;;;++xxxxxxxxxxxxXXXXXx++x                                       
                         +;;;;;;;;;;;;+xxXxxxxxxxxxxxxxXXXXXX                                       
                       +;;;;;;;;;;;;;++xXXXXxxxxxxxxxx+++++x                                        
                     x;;;;;;;;;;;;;;++X$$XXXXXXXXxxxx++++;;;+x                                      
                    +;;;;;;;;;;;;;;+xX      $$XXXxxxx+++++;;;;+                                     
                   +;;;;;;;;;;;;;;+xX           XXxxxx+++++;;;;+x                                   
                 +;;;;;;;;;;;;;;;+xX              xxxxxx++++;;;++                                   
               +;;;;;;;;;;;;;;;;+x               Xxxxxxxx+++++++x                                   
            x+;;;;;;;;;;;;;;;;;+X               xx++++++xx++++xx                                    
          +;;;;;;;;;;;;;;;;;;;+X               x+++xxx+xxxxxxxx                                     
        x+;;;;;;;;;;;;;;;;;;;+x               x+++++++++++++;;+                                     
        +;;;;;;;;;;;;;;;;;;;+X               x+++++++++++++++++x                                    
       x+;;;;;;;;;;;;;;;;;;;::;;;;;;;;;;;;;+:;+xxxxxxxxxxxxxxx;:;;;;;;;:::;; +                      
       ++++++++++++++++++++;::::::::::::::::::::::::::::::::::::::::::::::::::;+X                   
     x:::xxxxxxxxxxxxxxxx+;::::::::::::;;;;;;;;+xxxxx                                               `;

async function run() {
  try {
    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error("GITHUB_TOKEN is missing");

    const username = process.env.GITHUB_REPOSITORY_OWNER;
    const osInput = core.getInput("os");
    const ideInput = core.getInput("ide");
    const asciiInput = core.getInput("ascii_art") || defaultAscii;
    const themeInput = core.getInput("theme") || "dracula";
    const theme = themes[themeInput] || themes.dracula;

    const stats = await fetchStats(token, username);

    const asciiLines = asciiInput
      .split("\\n")
      .filter((l) => l.trim().length > 0 || l.length > 0);
    const detailsLines = [];

    const showOs = core.getInput("show_os") !== "false";
    const showUptime = core.getInput("show_uptime") !== "false";
    const showIde = core.getInput("show_ide") !== "false";
    const showLanguages = core.getInput("show_languages") !== "false";
    const showRepos = core.getInput("show_repos") !== "false";
    const showStars = core.getInput("show_stars") !== "false";
    const showCommits = core.getInput("show_commits") !== "false";
    const showFollowers = core.getInput("show_followers") !== "false";

    detailsLines.push(`${username}@github`);
    detailsLines.push("-------------------");
    if (showOs && osInput) detailsLines.push(`OS: ${osInput}`);
    if (showUptime) detailsLines.push(`Uptime: ${stats.uptime}`);
    if (showIde && ideInput) detailsLines.push(`IDE: ${ideInput}`);
    if (showLanguages && stats.languages)
      detailsLines.push(`Languages: ${stats.languages}`);
    detailsLines.push("");
    if (showRepos) detailsLines.push(`Repos: ${stats.repos}`);
    if (showStars) detailsLines.push(`Stars: ${stats.stars}`);
    if (showCommits) detailsLines.push(`Commits: ${stats.commits}`);
    if (showFollowers) detailsLines.push(`Followers: ${stats.followers}`);

    const svg = renderSvg(asciiLines, detailsLines, theme);
    fs.writeFileSync("neofetch.svg", svg);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
