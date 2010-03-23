data <- read.csv("~/browser.csv",header=F,dec='.',na.strings=c('XXXXXXX'))


names(data) <- c('filesize', 'strategy', 'trial', 'time')

averagedData <- aggregate(data, 
                          by=list(data$filesize, data$strategy), 
                          FUN=mean, 
                           na.rm=TRUE)

#Group.1 is the filesize
#Group.2 is the strategy

plot_colors <- c(rgb(r=0.0,g=0.0,b=0.9), "red", "forestgreen")

# Trim off excess margin space (bottom, left, top, right)par(mar=c(4.2, 3.8, 0.2, 0.2))
par(mar=c(4.3, 4, 0.2, 0.2))


# Graph autos using a y axis that uses the full range of value
# in autos_data. Label axes with smaller font and use larger 
# line widths.
plot(
    x=averagedData[averagedData$Group.2 == 0,]$Group.1, 
    y=averagedData[averagedData$Group.2 == 0,]$time, 
    type="o", 
       col=plot_colors[1], 
       ann=T, 
       ylim=range(averagedData$time), 
       xlab="File Size",
       ylab="Time", 
       cex.lab=1, 
       lwd=2,
       lty=1
)

lines(
    averagedData[averagedData$Group.2 == 1,]$Group.1, 
    averagedData[averagedData$Group.2 == 1,]$time, 
    type="o", 
    lty=2, 
    lwd=2, 
    col=plot_colors[2]
)


# Create a legend in the top-left corner that is slightly  
# smaller and has no border
legend(1, 10000, c("SQLite Binary", "JSON"), cex=0.8, col=plot_colors, lty=c(1,2), lwd=2, bty="n");
