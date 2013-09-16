function SourcePhrase (source, tarket, makers, prePunct, postPunct, inform, chapterVerse, glossText)
{
	this.source = source;
	this.target = target;
	this.markers = markers;
	this.prePunct = prePunct;
	this.postPunct = postPunct;
	this.inform = inform;
	this.chapterVerse = chapterVerse;
	this.glossText = glossText;
	
	this.exportPhrase = exportPhrase;
	function exportPhrase()
	{
		return (markers + prepunct + target + postPunct);
	}
}