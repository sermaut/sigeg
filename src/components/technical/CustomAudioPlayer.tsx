import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Settings } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface CustomAudioPlayerProps {
  audioUrl: string;
}

export function CustomAudioPlayer({ audioUrl }: CustomAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const changePlaybackRate = (rate: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time) || time === 0) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-br from-primary/5 via-primary/3 to-accent/5 rounded-xl p-4 border-2 border-primary/10 shadow-md">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      {/* Controles principais */}
      <div className="flex items-center gap-3 mb-3">
        {/* Botão Play/Pause */}
        <Button
          variant="default"
          size="icon"
          onClick={togglePlay}
          className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-white" />
          ) : (
            <Play className="w-5 h-5 fill-white ml-0.5" />
          )}
        </Button>

        {/* Tempo atual */}
        <span className="text-sm font-medium text-foreground min-w-[45px]">
          {formatTime(currentTime)}
        </span>

        {/* Barra de progresso */}
        <div className="flex-1 group">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleProgressChange}
            className="cursor-pointer"
          />
        </div>

        {/* Duração total */}
        <span className="text-sm text-muted-foreground min-w-[45px] text-right">
          {formatTime(duration)}
        </span>
      </div>

      {/* Controles secundários */}
      <div className="flex items-center justify-end gap-2">
        {/* Velocidade de reprodução */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 border-primary/20">
              <Settings className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">{playbackRate}x</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => changePlaybackRate(0.5)}>
              0.5x
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => changePlaybackRate(0.75)}>
              0.75x
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => changePlaybackRate(1)}>
              1x (Normal)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => changePlaybackRate(1.25)}>
              1.25x
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => changePlaybackRate(1.5)}>
              1.5x
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => changePlaybackRate(2)}>
              2x
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
