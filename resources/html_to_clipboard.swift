import Cocoa
let html = CommandLine.arguments[1]
NSPasteboard.general.clearContents()
NSPasteboard.general.setString(html, forType: .html)
